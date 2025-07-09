# model.py
import torch
import torch.nn as nn
import torchvision.models as models
import math
from . import config
import torch.nn.functional as F

# --- CNN Feature Extractor ---
class CNNFeatureExtractor(nn.Module):
    def __init__(self, output_dim=config.SPATIAL_CNN_FEATURES_DIM):
        super().__init__()
        resnet = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
        if resnet is None:
            raise RuntimeError("Failed to load ResNet18 model.")
        modules = list(resnet.children())[:-1]
        self.spatial_cnn = nn.Sequential(*modules)

    def forward(self, x):
        b, c, t, h, w = x.size()
        x = x.permute(0, 2, 1, 3, 4).contiguous()
        x = x.view(b * t, c, h, w)
        x = self.spatial_cnn(x)
        x = x.view(b * t, -1)
        x = x.view(b, t, -1)
        return x

# --- Auxiliary Head ---
class AuxiliaryHead(nn.Module):
    """A simple head for auxiliary CTC loss on intermediate features."""
    def __init__(self, input_dim, hidden_dim, gloss_vocab_size):
        super().__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.15) # Slightly less dropout for auxiliary
        self.fc2 = nn.Linear(hidden_dim, gloss_vocab_size)

    def forward(self, x):
        # x: (B, Num_Windows, Input_Dim)
        x = self.fc1(x)
        x = self.relu(x)
        x = self.dropout(x)
        logits = self.fc2(x) # (B, Num_Windows, Gloss_Vocab_Size)
        return logits

# --- Window Processor (Modified to output intermediate CNN features) ---
class WindowProcessor(nn.Module):
    def __init__(self, input_dim, cnn_output_dim, lstm_hidden_dim, final_output_dim,
                 window_size, stride, lstm_dropout,
                 use_aux_head=False, gloss_vocab_size=None, aux_head_hidden_dim=None):
        super().__init__()
        self.window_size = window_size
        self.stride = stride
        self.input_dim = input_dim
        self.cnn_output_dim = cnn_output_dim # This is the dim for aux head input
        self.lstm_hidden_dim = lstm_hidden_dim
        self.final_output_dim = final_output_dim
        self.use_aux_head = use_aux_head

        self.window_cnn = nn.Sequential(
            nn.Conv1d(input_dim, input_dim * 2, kernel_size=3, padding=1),
            nn.BatchNorm1d(input_dim * 2),
            nn.ReLU(inplace=True),
            nn.Conv1d(input_dim * 2, cnn_output_dim, kernel_size=3, padding=1),
            nn.BatchNorm1d(cnn_output_dim),
            nn.ReLU(inplace=True),
            # nn.AdaptiveAvgPool1d(1) # REMOVE AdaptiveAvgPool1d if cnn_out feeds LSTM
                                    # It's okay if cnn_out for aux head is different
                                    # Let's keep it for now, means aux head gets (B*Num_Win, cnn_out_dim)
        )
        self.adaptive_pool = nn.AdaptiveAvgPool1d(1) # Apply this specifically before LSTM input if needed

        self.lstm = nn.LSTM(
            input_size=cnn_output_dim, # LSTM input is output of window_cnn (after pooling)
            hidden_size=lstm_hidden_dim,
            num_layers=2,
            batch_first=True,
            bidirectional=True,
            dropout=lstm_dropout if 2 > 1 else 0
        )
        self.projection = nn.Linear(lstm_hidden_dim * 2, final_output_dim)
        self.layer_norm = nn.LayerNorm(final_output_dim)
        self.dropout_final = nn.Dropout(lstm_dropout)

        if self.use_aux_head:
            if gloss_vocab_size is None or aux_head_hidden_dim is None:
                raise ValueError("gloss_vocab_size and aux_head_hidden_dim must be provided if use_aux_head is True.")
            self.aux_head = AuxiliaryHead(cnn_output_dim, aux_head_hidden_dim, gloss_vocab_size)
        else:
            self.aux_head = None

    def forward(self, x):
        b, t_in, _ = x.shape
        aux_logits = None
        num_windows_expected = config.NUM_WINDOWS # Fallback for early exit

        if t_in < self.window_size:
             # Handle this case: maybe pad input, or return zeros?
             final_out_zeros = torch.zeros((b, num_windows_expected, self.final_output_dim), device=x.device, dtype=x.dtype)
             if self.use_aux_head:
                 # Need to determine expected shape for aux_logits if returning early
                 # This is tricky, let's assume for now if t_in is too small, aux_logits is None or zeros
                 # For simplicity, let's make aux_logits None and handle it in the main model
                 return final_out_zeros, None, num_windows_expected

             return final_out_zeros, num_windows_expected


        x_permuted = x.permute(0, 2, 1)
        num_possible_windows = math.floor((t_in - self.window_size) / self.stride) + 1
        if num_possible_windows <=0: # Should not happen if t_in >= window_size
            final_out_zeros = torch.zeros((b, num_windows_expected, self.final_output_dim), device=x.device, dtype=x.dtype)
            if self.use_aux_head: return final_out_zeros, None, num_windows_expected
            return final_out_zeros, num_windows_expected


        windows = x_permuted.unfold(dimension=2, size=self.window_size, step=self.stride)
        _, _, num_windows, window_size_dim = windows.shape

        if num_windows == 0: # Edge case handling
             final_out_zeros = torch.zeros((b, num_windows_expected, self.final_output_dim), device=x.device, dtype=x.dtype)
             if self.use_aux_head: return final_out_zeros, None, num_windows_expected
             return final_out_zeros, num_windows_expected

        windows_for_cnn = windows.permute(0, 2, 1, 3).contiguous()
        windows_for_cnn = windows_for_cnn.view(b * num_windows, self.input_dim, window_size_dim)

        # Output from main CNN path in WindowProcessor
        cnn_features = self.window_cnn(windows_for_cnn) # (B * Num_Windows, cnn_output_dim, window_size_after_cnn_layers)
                                                        # The paper's SPN is on S3D blocks. Our aux is on output of 1D CNN over windows.
                                                        # For aux head, we need (B, Num_Windows, cnn_output_dim)
        
        # Prepare for Aux Head
        if self.use_aux_head:
            # cnn_features_pooled_for_aux shape (B * Num_Windows, cnn_output_dim)
            cnn_features_pooled_for_aux = self.adaptive_pool(cnn_features).squeeze(-1)
            # Reshape for AuxHead: (B, Num_Windows, cnn_output_dim)
            cnn_features_for_aux_reshaped = cnn_features_pooled_for_aux.view(b, num_windows, self.cnn_output_dim)
            aux_logits = self.aux_head(cnn_features_for_aux_reshaped) # (B, Num_Windows, Vocab_Size)

        # Prepare for LSTM
        # cnn_out_for_lstm shape (B * Num_Windows, cnn_output_dim)
        cnn_out_for_lstm = self.adaptive_pool(cnn_features).squeeze(-1)
        lstm_input = cnn_out_for_lstm.view(b, num_windows, self.cnn_output_dim)
        lstm_output, _ = self.lstm(lstm_input)
        projected_output = self.projection(lstm_output)
        projected_output = self.layer_norm(projected_output)
        final_output = self.dropout_final(projected_output) # (B, Num_Windows, final_output_dim)

        if self.use_aux_head:
            return final_output, aux_logits, num_windows
        else:
            return final_output, num_windows


# --- Bidirectional Lateral Connection ---
class BidirectionalLateralConnection(nn.Module):
    def __init__(self, dim_rgb, dim_kp, output_dim):
        super().__init__()
        self.proj_rgb = nn.Linear(dim_rgb, output_dim) if dim_rgb != output_dim else nn.Identity()
        self.proj_kp = nn.Linear(dim_kp, output_dim) if dim_kp != output_dim else nn.Identity()
        # Potentially add LayerNorms here
        self.norm_rgb = nn.LayerNorm(output_dim)
        self.norm_kp = nn.LayerNorm(output_dim)


    def forward(self, feat_rgb, feat_kp):
        # feat_rgb: (B, Num_Windows, dim_rgb)
        # feat_kp: (B, Num_Windows, dim_kp)

        # Project to common dimension
        proj_feat_rgb = self.proj_rgb(feat_rgb)
        proj_feat_kp = self.proj_kp(feat_kp)

        # Information exchange
        # Paper implies features are added. Then the original stream continues with the modified feature.
        # Option 1: Additive fusion
        # feat_rgb_enhanced = self.norm_rgb(proj_feat_rgb + proj_feat_kp)
        # feat_kp_enhanced = self.norm_kp(proj_feat_kp + proj_feat_rgb) # Symmetrical

        # Option 2: The paper's diagram (Fig 2) suggests C1_video feeds into C1_kp and vice versa.
        # The "S3D-Video" stream receives input from "S3D-Keypoint" stream.
        # This implies the features are updated *in place* or passed on.
        # Let's return the features that each stream will *then* use.
        
        # Updated features for each stream incorporating info from the other
        # The paper's diagram shows features from one stream being *added* to the other stream's features
        # at the same block level, and then that stream continues.
        # So, RGB stream gets KP info, KP stream gets RGB info.
        rgb_out = self.norm_rgb(proj_feat_rgb + proj_feat_kp) # proj_feat_kp acts as the lateral input
        kp_out = self.norm_kp(proj_feat_kp + proj_feat_rgb)   # proj_feat_rgb acts as the lateral input

        return rgb_out, kp_out # (B, Num_Windows, output_dim) for both

# --- Stream Head ---
class StreamHead(nn.Module):
    """Processes features from a stream and outputs gloss logits."""
    def __init__(self, input_dim, hidden_dim, gloss_vocab_size, num_lstm_layers=1, dropout=0.15):
        super().__init__()
        self.temporal_model = nn.LSTM(
            input_dim, hidden_dim // 2 if num_lstm_layers > 0 else hidden_dim, # //2 for bidirectional
            num_layers=num_lstm_layers,
            batch_first=True,
            bidirectional=True if num_lstm_layers > 0 else False,
            dropout=dropout if num_lstm_layers > 1 else 0
        ) if num_lstm_layers > 0 else nn.Identity()
        
        # Determine input dim for FC layer based on whether LSTM is used
        fc_input_dim = hidden_dim if num_lstm_layers > 0 else input_dim

        self.fc1 = nn.Linear(fc_input_dim, hidden_dim)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(dropout)
        self.fc2 = nn.Linear(hidden_dim, gloss_vocab_size)
        self.layer_norm = nn.LayerNorm(fc_input_dim)


    def forward(self, x):
        # x: (B, Num_Windows, Input_Dim)
        if not isinstance(self.temporal_model, nn.Identity):
            x_temp, _ = self.temporal_model(x)
        else:
            x_temp = x
        
        x_norm = self.layer_norm(x_temp)
        x_fc = self.fc1(x_norm)
        x_fc = self.relu(x_fc)
        x_fc = self.dropout(x_fc)
        logits = self.fc2(x_fc) # (B, Num_Windows, Gloss_Vocab_Size)
        return logits

# --- TwoStreamSLRModel ---
class TwoStreamSLRModel(nn.Module):
    def __init__(self, gloss_vocab_size):
        super().__init__()
        self.gloss_vocab_size = gloss_vocab_size

        # 1. Spatial Feature Extractor (for RGB)
        self.cnn_feature_extractor = CNNFeatureExtractor(config.SPATIAL_CNN_FEATURES_DIM)

        # 2. RGB Window Processor
        self.rgb_window_processor = WindowProcessor(
            input_dim=config.SPATIAL_CNN_FEATURES_DIM,
            cnn_output_dim=config.RGB_WINDOW_CNN_OUTPUT_DIM,
            lstm_hidden_dim=config.RGB_WINDOW_LSTM_HIDDEN_DIM,
            final_output_dim=config.RGB_WINDOW_FINAL_DIM,
            window_size=config.WINDOW_SIZE,
            stride=config.WINDOW_STRIDE,
            lstm_dropout=config.RGB_WINDOW_LSTM_DROPOUT,
            use_aux_head=True, # Enable auxiliary head
            gloss_vocab_size=gloss_vocab_size,
            aux_head_hidden_dim=config.AUX_HEAD_HIDDEN_DIM
        )

        # 3. Keypoint Window Processor
        self.kp_window_processor = WindowProcessor(
            input_dim=config.KEYPOINT_INPUT_DIM,
            cnn_output_dim=config.KP_WINDOW_CNN_OUTPUT_DIM,
            lstm_hidden_dim=config.KP_WINDOW_LSTM_HIDDEN_DIM,
            final_output_dim=config.KP_WINDOW_FINAL_DIM,
            window_size=config.WINDOW_SIZE,
            stride=config.WINDOW_STRIDE,
            lstm_dropout=config.KP_WINDOW_LSTM_DROPOUT,
            use_aux_head=True, # Enable auxiliary head
            gloss_vocab_size=gloss_vocab_size,
            aux_head_hidden_dim=config.AUX_HEAD_HIDDEN_DIM
        )

        # 4. Bidirectional Lateral Connection
        # It will connect outputs of rgb_window_processor and kp_window_processor
        self.lateral_connection = BidirectionalLateralConnection(
            dim_rgb=config.RGB_WINDOW_FINAL_DIM,
            dim_kp=config.KP_WINDOW_FINAL_DIM,
            output_dim=config.LATERAL_CONNECTION_DIM
        )

        # 5. Individual Stream Heads (after lateral connection)
        # Input dim for these heads is LATERAL_CONNECTION_DIM
        self.video_stream_head = StreamHead(
            input_dim=config.LATERAL_CONNECTION_DIM,
            hidden_dim=config.ENCODER_OUTPUT_DIM,
            gloss_vocab_size=gloss_vocab_size
        )
        self.keypoint_stream_head = StreamHead(
            input_dim=config.LATERAL_CONNECTION_DIM,
            hidden_dim=config.ENCODER_OUTPUT_DIM,
            gloss_vocab_size=gloss_vocab_size
        )

        # 6. Joint Head
        # Input is concatenation of features from both streams (after lateral connection)
        joint_head_input_dim = config.LATERAL_CONNECTION_DIM * 2
        self.joint_head = StreamHead(
            input_dim=joint_head_input_dim,
            hidden_dim=config.ENCODER_OUTPUT_DIM, # Larger hidden dim for joint processing
            gloss_vocab_size=gloss_vocab_size,
            num_lstm_layers=config.GLOBAL_LSTM_NUM_LAYERS, # Make joint head more powerful
            dropout=config.GLOBAL_LSTM_DROPOUT
        )

        print(f"TwoStreamSLRModel Initialized with 3 main heads and 2 auxiliary heads.")
        print(f"  Lateral Connection Dim: {config.LATERAL_CONNECTION_DIM}")
        print(f"  Stream/Joint Head Hidden Dim: {config.ENCODER_OUTPUT_DIM}")


    def forward(self, src, kp):
        # src: (B, C, T_in, H, W)
        # kp: (B, T_in, KP_INPUT_DIM)
        batch_size = src.size(0)

        # --- RGB Stream ---
        spatial_features = self.cnn_feature_extractor(src) # (B, T_in, SPATIAL_CNN_DIM)
        # rgb_features_raw, aux_logits_video, num_windows_rgb = self.rgb_window_processor(spatial_features)
        processed_rgb = self.rgb_window_processor(spatial_features)
        if len(processed_rgb) == 3:
            rgb_features_raw, aux_logits_video, num_windows_rgb = processed_rgb
        else: # len == 2, no aux head output (e.g. due to small input)
            rgb_features_raw, num_windows_rgb = processed_rgb
            aux_logits_video = None
        # rgb_features_raw: (B, Num_Windows_RGB, RGB_WINDOW_FINAL_DIM)
        # aux_logits_video: (B, Num_Windows_RGB, Vocab_Size) or None

        # --- Keypoint Stream ---
        # kp_features_raw, aux_logits_kp, num_windows_kp = self.kp_window_processor(kp)
        processed_kp = self.kp_window_processor(kp)
        if len(processed_kp) == 3:
            kp_features_raw, aux_logits_kp, num_windows_kp = processed_kp
        else:
            kp_features_raw, num_windows_kp = processed_kp
            aux_logits_kp = None
        # kp_features_raw: (B, Num_Windows_KP, KP_WINDOW_FINAL_DIM)
        # aux_logits_kp: (B, Num_Windows_KP, Vocab_Size) or None
        
        # Robust handling of num_windows
        if num_windows_rgb != num_windows_kp:
            # print(f"Warning: num_windows mismatch! RGB: {num_windows_rgb}, KP: {num_windows_kp}. Taking min.")
            num_windows = min(num_windows_rgb, num_windows_kp)
            if num_windows == 0 : # If min is zero, this batch is problematic
                 # Return None for all logits and lengths to signal skip in train loop
                 return None, None, None, None, None, torch.zeros(batch_size, dtype=torch.long, device=src.device)

            rgb_features_raw = rgb_features_raw[:, :num_windows, :]
            kp_features_raw = kp_features_raw[:, :num_windows, :]
            if aux_logits_video is not None: aux_logits_video = aux_logits_video[:, :num_windows, :]
            if aux_logits_kp is not None: aux_logits_kp = aux_logits_kp[:, :num_windows, :]
        else:
            num_windows = num_windows_rgb
            if num_windows == 0:
                 return None, None, None, None, None, torch.zeros(batch_size, dtype=torch.long, device=src.device)


        # --- Bidirectional Lateral Connection ---
        # rgb_feat_enhanced, kp_feat_enhanced will have LATERAL_CONNECTION_DIM
        rgb_feat_enhanced, kp_feat_enhanced = self.lateral_connection(rgb_features_raw, kp_features_raw)

        # --- Individual Stream Heads ---
        logits_video = self.video_stream_head(rgb_feat_enhanced) # (B, Num_Windows, Vocab_Size)
        logits_kp = self.keypoint_stream_head(kp_feat_enhanced)   # (B, Num_Windows, Vocab_Size)

        # --- Joint Head ---
        # Concatenate the *enhanced* features from the streams
        joint_input_features = torch.cat((rgb_feat_enhanced, kp_feat_enhanced), dim=-1)
        logits_joint = self.joint_head(joint_input_features) # (B, Num_Windows, Vocab_Size)

        # --- Prepare for CTC Loss (expects T, B, C) ---
        def to_ctc_format(logits_batch_first):
            if logits_batch_first is None: return None
            log_probs_batch_first = F.log_softmax(logits_batch_first, dim=2)
            return log_probs_batch_first.permute(1, 0, 2) # (Num_Windows, B, Vocab_Size)

        log_probs_video_ctc = to_ctc_format(logits_video)
        log_probs_kp_ctc = to_ctc_format(logits_kp)
        log_probs_joint_ctc = to_ctc_format(logits_joint) # This is the main one for inference ensemble

        # For auxiliary losses
        aux_log_probs_video_ctc = to_ctc_format(aux_logits_video)
        aux_log_probs_kp_ctc = to_ctc_format(aux_logits_kp)

        # Input lengths for CTC
        input_lengths = torch.full(size=(batch_size,), fill_value=num_windows, dtype=torch.long, device=src.device)
        
        # Return all necessary outputs for loss calculation and inference
        return (log_probs_video_ctc, log_probs_kp_ctc, log_probs_joint_ctc, # For main CTC losses + ensemble
                aux_log_probs_video_ctc, aux_log_probs_kp_ctc,             # For auxiliary CTC losses
                logits_video, logits_kp, logits_joint,                     # Batch-first logits for distillation
                input_lengths)