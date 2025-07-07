import torch
import os
import numpy as np
from .SLR.bilstm_encoder import BiLSTMEncoder 
from .SLR.linear_ctc_head import LinearCTCHead 
from .SLR.tokenizer import SimpleTokenizer 
from .SLR.temp_v2 import Temporal1DEncoderV2
from torch.nn.functional import log_softmax
from .SLR.ctc_decode import ctc_beam_search_decoder 

APP_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POC2_DIR = os.path.join(APP_DIR, 'POC2')

class CTCPredictor:
    """
    A class to hold pre-loaded models and tokenizer for CTC prediction,
    avoiding reloading them on every call.
    """
    def __init__(self, model_path, vocab_path, config):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"🚀 Initializing CTCPredictor on device: {self.device}")

        # 1. Load Tokenizer
        if not os.path.exists(vocab_path):
            raise FileNotFoundError(f"Vocab file not found at {vocab_path}")
        self.tokenizer = SimpleTokenizer()
        self.tokenizer.load_vocab(vocab_path)
        print(f"Loaded vocab with {self.tokenizer.vocab_size()} tokens.")

        # 2. Load Models
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model checkpoint not found at {model_path}")
        checkpoint = torch.load(model_path, map_location=self.device)

        self.cnn_encoder = Temporal1DEncoderV2(
            input_dim=config['input_dim'],
            block_dims=config['cnn_block_dims'],
            out_dim=config['cnn_output_dim'],
            kernel_size=config['cnn_kernel_size'],
            num_blocks_per_stage=config['cnn_num_blocks'],
            dropout_rate=config['cnn_dropout_rate']
        ).to(self.device)

        self.bilstm_encoder = BiLSTMEncoder(
            input_dim=config['cnn_output_dim'],
            lstm_hidden_dim=config['lstm_hidden_dim'],
            num_layers=config['num_encoder_layers'],
            dropout=config['bilstm_dropout']
        ).to(self.device)

        classifier_input_dim = self.bilstm_encoder.get_output_dim()
        self.classifier = LinearCTCHead(
            model_dim=classifier_input_dim,
            vocab_size=self.tokenizer.vocab_size()
        ).to(self.device)

        # 3. Load State Dicts
        self.cnn_encoder.load_state_dict(checkpoint["cnn_encoder_state_dict"])
        self.bilstm_encoder.load_state_dict(checkpoint["bilstm_encoder_state_dict"])
        self.classifier.load_state_dict(checkpoint["classifier_state_dict"])

        # 4. Set to Eval Mode
        self.cnn_encoder.eval()
        self.bilstm_encoder.eval()
        self.classifier.eval()
        print("✅ CTC models loaded and set to evaluation mode.")

    @torch.no_grad()
    def predict(self, features_path, beam_width=1):
        """
        Generates a gloss prediction for a single feature file.
        Args:
            features_path (str): Path to the .npy file containing keypoint features.
            beam_width (int): The beam width for the CTC beam search decoder.
        Returns:
            str: The predicted gloss sequence.
        """
        # Load features
        loaded_features = np.load(features_path)
        features = torch.tensor(loaded_features, dtype=torch.float32).unsqueeze(0).to(self.device)

        # Forward pass
        cnn_out = self.cnn_encoder(features)
        bilstm_out = self.bilstm_encoder(cnn_out)
        logits = self.classifier(bilstm_out)
        log_probs = log_softmax(logits, dim=-1)

        # Decode
        input_lengths = torch.tensor([log_probs.shape[1]], device=self.device)
        blank_idx = self.tokenizer.get_blank_idx()
        
        if beam_width > 1 and ctc_beam_search_decoder is not None:
            pred_ids_batch = ctc_beam_search_decoder(
                log_probs_batch=log_probs,
                input_lengths=input_lengths,
                beam_width=beam_width,
                blank_idx=blank_idx
            )
            pred_tokens = pred_ids_batch[0]
        else:
            pred_ids = torch.argmax(log_probs, dim=-1).squeeze(0).tolist()
            pred_tokens = [p for j, p in enumerate(pred_ids) if p != blank_idx and (j == 0 or p != pred_ids[j - 1])]

        pred_tokens_filtered = [t for t in pred_tokens if t != self.tokenizer.get_pad_idx()]
        pred_text = self.tokenizer.decode(pred_tokens_filtered)
        
        return pred_text
    

PREDICTOR_INSTANCE = None

def generate_ctc_predictions(
    features_path,
    model_path,
    input_dim,
    cnn_output_dim,
    lstm_hidden_dim,
    num_encoder_layers,
    beam_width=1
):
    """
    Wrapper function to initialize the predictor once and generate a prediction for a single file.
    """
    global PREDICTOR_INSTANCE
    
    # Initialize the predictor on the first call
    if PREDICTOR_INSTANCE is None:
        model_config = {
            'input_dim': input_dim,
            'cnn_output_dim': cnn_output_dim,
            'lstm_hidden_dim': lstm_hidden_dim,
            'num_encoder_layers': num_encoder_layers,
            'cnn_block_dims': [128, 256, 512],
            'cnn_num_blocks': [2, 2, 2],
            'cnn_kernel_size': 5,
            'cnn_dropout_rate': 0.2,
            'bilstm_dropout': 0.4,
        }
        PREDICTOR_INSTANCE = CTCPredictor(
            model_path=model_path,
            vocab_path=os.path.join(POC2_DIR, "checkpoints/vocab.json"),
            config=model_config
        )
        
    # Generate and return the prediction
    predicted_gloss = PREDICTOR_INSTANCE.predict(features_path, beam_width=beam_width)
    
    return predicted_gloss