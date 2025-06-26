import os
import glob
import numpy as np
import torch
import cv2
from torchvision import transforms
from transformers import AutoTokenizer

# Imports from within pipeline_v2
from . import config as v2_config # Important: uses the config within pipeline_v2
from .model import TwoStreamSLRModel
from .model_translator import GlossToTextTranslatorT5
from .vocabulary import Vocabulary as GlossVocabularyV2
from .utils import ctc_decode_greedy, load_checkpoint as load_checkpoint_v2

# For keypoint extraction (logic adapted from pipeline_v2.extract_keypoints.py)
import mediapipe as mp
from .extract_keypoints import (
    extract_landmarks_from_results, 
    normalize_frame_keypoints,
    TOTAL_LANDMARKS as V2_TOTAL_LANDMARKS, # Use constants from extract_keypoints
    NUM_COORDS as V2_NUM_COORDS
)

APP_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # app directory
PIPELINE_V2_DIR = os.path.join(APP_DIR, 'pipeline_v2')

MODELS_V2 = {}

def get_v2_transforms(): # Based on dataset.py from V2 project
    return transforms.Compose([
        transforms.ToPILImage(),
        transforms.Resize(v2_config.IMG_SIZE), # (224, 224)
        transforms.ToTensor(),
        transforms.Normalize(mean=v2_config.RGB_MEAN, std=v2_config.RGB_STD)
    ])

def load_v2_models():
    """Load Pipeline V2 models into memory."""
    print("Pre-loading Pipeline V2 AI models...")
    device = torch.device(v2_config.DEVICE)
    MODELS_V2['device'] = device

    # 1. V2 Gloss Vocabulary
    v2_gloss_vocab_path = os.path.join(PIPELINE_V2_DIR, v2_config.VOCAB_PATH_GLOSS)
    if not os.path.exists(v2_gloss_vocab_path):
        # Fallback to constructing path if original v2_config.VOCAB_PATH_GLOSS was relative to project root
        alt_vocab_path = os.path.join(PIPELINE_V2_DIR, 'assets', 'data', 'phoenix_gloss.vocab') # Example, adjust if needed
        if os.path.exists(alt_vocab_path):
            v2_gloss_vocab_path = alt_vocab_path
        else:
            raise FileNotFoundError(f"V2 Gloss vocab not found at {v2_gloss_vocab_path} or {alt_vocab_path}")
    
    MODELS_V2['gloss_vocab_v2'] = GlossVocabularyV2(v2_gloss_vocab_path)
    print(f"Pipeline V2: Gloss Vocabulary loaded (size: {len(MODELS_V2['gloss_vocab_v2'])})")

    # 2. V2 SLR Model (TwoStreamSLRModel)
    slr_model_v2 = TwoStreamSLRModel(gloss_vocab_size=len(MODELS_V2['gloss_vocab_v2'])).to(device)
    slr_checkpoint_path_v2 = os.path.join(PIPELINE_V2_DIR, v2_config.CHECKPOINT_DIR_SLR, v2_config.BEST_MODEL_NAME_SLR)
    if not os.path.exists(slr_checkpoint_path_v2):
         alt_slr_path = os.path.join(PIPELINE_V2_DIR, 'assets', 'checkpoints_slr_ctc', v2_config.BEST_MODEL_NAME_SLR) # MODIFIED HERE
         if os.path.exists(alt_slr_path): slr_checkpoint_path_v2 = alt_slr_path
         else: raise FileNotFoundError(f"V2 SLR checkpoint not found at {slr_checkpoint_path_v2} or {alt_slr_path}")

    load_checkpoint_v2(slr_checkpoint_path_v2, slr_model_v2)
    slr_model_v2.eval()
    MODELS_V2['slr_model_v2'] = slr_model_v2
    print("Pipeline V2: TwoStreamSLRModel loaded.")

    # 3. V2 Text Tokenizer (for T5) & T5 Translator Model
    MODELS_V2['text_tokenizer_v2'] = AutoTokenizer.from_pretrained(v2_config.TRANSLATOR_MODEL_NAME)
    
    translator_model_v2 = GlossToTextTranslatorT5(model_name_or_path=v2_config.TRANSLATOR_MODEL_NAME).to(device)
    translator_checkpoint_path_v2 = os.path.join(PIPELINE_V2_DIR, v2_config.CHECKPOINT_DIR_TRANSLATOR, v2_config.BEST_MODEL_NAME_TRANSLATOR)
    if not os.path.exists(translator_checkpoint_path_v2):
        alt_translator_path = os.path.join(PIPELINE_V2_DIR, 'assets', 'checkpoints_translator_t5', v2_config.BEST_MODEL_NAME_TRANSLATOR) # This was already correct
        if os.path.exists(alt_translator_path): translator_checkpoint_path_v2 = alt_translator_path
        else: raise FileNotFoundError(f"V2 Translator checkpoint not found at {translator_checkpoint_path_v2} or {alt_translator_path}")

    load_checkpoint_v2(translator_checkpoint_path_v2, translator_model_v2) # This load_checkpoint needs to handle T5's structure
    translator_model_v2.eval()
    MODELS_V2['translator_model_v2'] = translator_model_v2
    print("Pipeline V2: GlossToTextTranslatorT5 loaded.")

    # 4. MediaPipe Holistic Model
    MODELS_V2['holistic_mp'] = mp.solutions.holistic.Holistic(
        static_image_mode=True, model_complexity=1,
        min_detection_confidence=0.5, min_tracking_confidence=0.5
    )
    print("Pipeline V2: MediaPipe Holistic model initialized.")
    
    # 5. V2 Frame Transforms
    MODELS_V2['v2_transforms'] = get_v2_transforms()
    print("Pipeline V2: Frame transforms initialized.")


def extract_keypoints_v2_mediapipe(video_frames_dir: str, task_temp_dir: str) -> str:
    """Extracts and normalizes keypoints using MediaPipe, saves them."""
    print(f"Pipeline V2: Extracting MediaPipe keypoints from {video_frames_dir}")
    keypoints_output_file = os.path.join(task_temp_dir, 'keypoints_v2.npy')
    
    holistic = MODELS_V2['holistic_mp']
    image_paths = sorted(glob.glob(os.path.join(video_frames_dir, '*.jpg')))
    if not image_paths:
        raise FileNotFoundError(f"No frames found in {video_frames_dir} for V2 keypoint extraction.")

    video_keypoints_normalized_list = []
    for img_path in image_paths:
        img = cv2.imread(img_path)
        if img is None: continue
        
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img_rgb.flags.writeable = False
        results = holistic.process(img_rgb)
        
        frame_landmarks_raw = extract_landmarks_from_results(results) # From .extract_keypoints
        frame_landmarks_norm = normalize_frame_keypoints(frame_landmarks_raw) # From .extract_keypoints
        video_keypoints_normalized_list.append(frame_landmarks_norm)

    if not video_keypoints_normalized_list:
        raise ValueError("No keypoints extracted with MediaPipe.")

    stacked_keypoints = np.stack(video_keypoints_normalized_list, axis=0)
    # Expected shape (T, V2_TOTAL_LANDMARKS, V2_NUM_COORDS)
    
    np.save(keypoints_output_file, stacked_keypoints)
    print(f"Pipeline V2: MediaPipe keypoints saved to {keypoints_output_file}")
    return keypoints_output_file

@torch.no_grad()
def run_translation_pipeline_v2(video_frames_dir: str, task_temp_dir: str) -> str:
    """Runs the complete Pipeline V2."""
    device = MODELS_V2['device']
    
    # 1. Keypoint Extraction (MediaPipe)
    keypoints_v2_file = extract_keypoints_v2_mediapipe(video_frames_dir, task_temp_dir)
    all_keypoints_v2_raw = np.load(keypoints_v2_file) # (Actual_T, V2_TOTAL_LANDMARKS, V2_NUM_COORDS)
    
    # Flatten keypoints for SLR model: (Actual_T, V2_TOTAL_LANDMARKS * V2_NUM_COORDS)
    # V2_KEYPOINT_INPUT_DIM = V2_TOTAL_LANDMARKS * V2_NUM_COORDS
    # This should match v2_config.KEYPOINT_INPUT_DIM (381)
    all_keypoints_v2_flat = all_keypoints_v2_raw.reshape(all_keypoints_v2_raw.shape[0], -1)

    # 2. Load RGB Frames and Apply Transforms
    image_paths = sorted(glob.glob(os.path.join(video_frames_dir, '*.jpg')))
    if not image_paths:
        raise FileNotFoundError(f"No frames found in {video_frames_dir} for V2 frame loading.")
    
    all_frames_raw = []
    for img_path in image_paths:
        img = cv2.imread(img_path)
        if img is None: continue
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        all_frames_raw.append(img_rgb)
    
    if not all_frames_raw:
        raise ValueError("Could not load any frames for V2.")

    # 3. Temporal Subsampling/Padding for Frames and Keypoints (to v2_config.NUM_FRAMES)
    actual_num_frames = len(all_frames_raw)
    actual_num_keypoints_frames = all_keypoints_v2_flat.shape[0]

    if actual_num_frames != actual_num_keypoints_frames:
        print(f"Pipeline V2 Warning: Frame count ({actual_num_frames}) and keypoint frame count ({actual_num_keypoints_frames}) mismatch. Using minimum.")
        min_len = min(actual_num_frames, actual_num_keypoints_frames)
        if min_len == 0: raise ValueError("Zero length after frame/keypoint sync for V2.")
        all_frames_raw = all_frames_raw[:min_len]
        all_keypoints_v2_flat = all_keypoints_v2_flat[:min_len]
        actual_num_frames = min_len
    elif actual_num_frames == 0:
        raise ValueError("No frames or keypoints to process for V2.")
        
    target_num_input_frames = v2_config.NUM_FRAMES # e.g., 64
    indices = np.linspace(0, actual_num_frames - 1, num=target_num_input_frames, dtype=int)
    
    selected_raw_frames = [all_frames_raw[i] for i in indices]
    selected_keypoints_flat = all_keypoints_v2_flat[indices]

    v2_transforms = MODELS_V2['v2_transforms']
    frames_tensor_list = [v2_transforms(frame) for frame in selected_raw_frames]
    frames_tensor_input = torch.stack(frames_tensor_list).unsqueeze(0).to(device) # (1, C, T_in, H, W)
    # TwoStreamSLRModel expects (B, C, T_in, H, W)
    # Our v2_transforms already make it (C,H,W), stack makes (T_in,C,H,W), unsqueeze(0) for B=1
    # Then permute for cnn_feature_extractor: (B, T_in, C, H, W) -> (B, C, T_in, H, W)
    # Actually, CNNFeatureExtractor in model.py expects (B, C, T_in, H, W) directly.
    # The stack gives (T_in, C, H, W), so after unsqueeze(0) it's (1, T_in, C, H, W).
    # We need to permute it to (1, C, T_in, H, W)
    frames_tensor_input = frames_tensor_input.permute(0, 2, 1, 3, 4)


    keypoints_tensor_input = torch.from_numpy(selected_keypoints_flat.astype(np.float32)).unsqueeze(0).to(device) # (1, T_in, KP_INPUT_DIM)

    print(f"Pipeline V2: Frames tensor shape: {frames_tensor_input.shape}, Keypoints tensor shape: {keypoints_tensor_input.shape}")

    # 4. Gloss Prediction (TwoStreamSLRModel)
    slr_model_v2 = MODELS_V2['slr_model_v2']
    slr_outputs = slr_model_v2(frames_tensor_input, keypoints_tensor_input)
    
    # Assuming slr_outputs format: (log_probs_video_ctc, log_probs_kp_ctc, log_probs_joint_ctc,
    #                               aux_log_probs_video_ctc, aux_log_probs_kp_ctc,
    #                               logits_video_bf, logits_kp_bf, logits_joint_bf,
    #                               input_lengths)
    if slr_outputs[0] is None and len(slr_outputs) > 1 and slr_outputs[-1] is not None and torch.all(slr_outputs[-1] == 0) :
        raise ValueError("Pipeline V2: SLR model returned no valid output (possibly zero windows).")

    # Use ensembled logits for prediction (as in V2's evaluate function)
    logits_video_bf, logits_kp_bf, logits_joint_bf = slr_outputs[5], slr_outputs[6], slr_outputs[7]
    input_lengths_ctc = slr_outputs[8]

    if logits_video_bf is None or logits_kp_bf is None or logits_joint_bf is None:
        # Fallback to joint_ctc if full ensemble components are not available (shouldn't happen with current model)
        print("Pipeline V2 Warning: Not all logits available for full ensemble, falling back to joint_ctc.")
        log_probs_ctc_pred = slr_outputs[2] # log_probs_joint_ctc (T, B, C)
    else:
        probs_video = torch.softmax(logits_video_bf, dim=2)
        probs_kp = torch.softmax(logits_kp_bf, dim=2)
        probs_joint = torch.softmax(logits_joint_bf, dim=2)
        ensembled_probs = (probs_video + probs_kp + probs_joint) / 3.0
        ensembled_log_probs = torch.log(ensembled_probs.clamp(min=1e-9))
        log_probs_ctc_pred = ensembled_log_probs.permute(1, 0, 2) # (Num_Windows=T_out, B, Vocab_Size)

    predicted_gloss_strings_batch = ctc_decode_greedy(
        log_probs_ctc_pred, 
        input_lengths_ctc, 
        MODELS_V2['gloss_vocab_v2']
    )
    predicted_glosses_v2 = predicted_gloss_strings_batch[0] if predicted_gloss_strings_batch else ""
    print(f"Pipeline V2: Predicted glosses: '{predicted_glosses_v2}'")

    # 5. Gloss Translation (T5)
    translator_model_v2 = MODELS_V2['translator_model_v2']
    text_tokenizer_v2 = MODELS_V2['text_tokenizer_v2']
    
    input_text_for_t5 = v2_config.T5_PREFIX_GLOSS_TO_GERMAN + predicted_glosses_v2.upper()
    tokenized_gloss_for_t5 = text_tokenizer_v2(
        input_text_for_t5,
        max_length=v2_config.MAX_GLOSS_SEQ_LEN,
        padding="max_length", # Pad to max_length
        truncation=True,
        return_tensors="pt"
    ).to(device)

    generated_ids = translator_model_v2.generate(
        input_ids=tokenized_gloss_for_t5.input_ids,
        attention_mask=tokenized_gloss_for_t5.attention_mask,
        max_length=v2_config.MAX_TEXT_SEQ_LEN + 10,
        num_beams=v2_config.TRANSLATOR_BEAM_SIZE,
        early_stopping=True
    )
    final_text_v2 = text_tokenizer_v2.decode(generated_ids[0], skip_special_tokens=True)
    print(f"Pipeline V2: Final translated text: '{final_text_v2}'")
    
    return final_text_v2