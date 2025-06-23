# backend/app/ai_pipeline.py
import os
import glob
import numpy as np
import torch
from mmpose.apis import inference_topdown, init_model
from mmpose.structures import merge_data_samples

from .POC2.generate_ctc_predictions import CTCPredictor
from .POC2.translate_glosses import GlossTranslator

APP_DIR = os.path.dirname(os.path.abspath(__file__)) 
POC2_DIR = os.path.join(APP_DIR, 'POC2')

# Dictionary to hold pre-loaded models
MODELS = {}

def load_models():
    """Load all AI models into memory only once."""
    print("Pre-loading AI models...")
    # 1. Keypoint Extraction Model (MMPose)
    config = os.path.join(POC2_DIR, 'MMPose/config/wholebody/rtmpose-l_8xb32-270e_coco-ubody-wholebody-384x288.py')
    checkpoint = os.path.join(POC2_DIR, 'MMPose/checkpoint/wholebody/rtmpose-l_simcc-ucoco_dw-ucoco_270e-384x288-2438fd99_20230728.pth')
    device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
    MODELS['keypoint_extractor'] = init_model(config, checkpoint, device=device)
    print(f"Keypoint extractor loaded.")
    
    ctc_model_config = {
        'input_dim': 369, # Mettez une valeur fixe, car elle sera la même pour toutes les vidéos
        'cnn_output_dim': 512, 'lstm_hidden_dim': 384, 'num_encoder_layers': 3,
        'cnn_block_dims': [128, 256, 512], 'cnn_num_blocks': [2, 2, 2],
        'cnn_kernel_size': 5, 'cnn_dropout_rate': 0.2, 'bilstm_dropout': 0.4,
    }
    MODELS['ctc_predictor'] = CTCPredictor(
        model_path=os.path.join(POC2_DIR, "checkpoints/model.pt"),
        vocab_path=os.path.join(POC2_DIR, "checkpoints/vocab.json"),
        config=ctc_model_config
    )
    print(f"CTC Predictor loaded.")

    # 3. Gloss Translator
    MODELS['gloss_translator'] = GlossTranslator(model_dir=os.path.join(POC2_DIR, "flan_model"))
    print(f"Gloss Translator loaded.")


def run_translation_pipeline(video_frames_dir: str, task_temp_dir: str) -> str:
    """
    Runs the complete pipeline on a sequence of frames.
    Args:
        video_frames_dir: The folder containing the extracted video frames.
        task_temp_dir: The unique folder for this task to store intermediate files.
    Returns:
        The translated sentence as text.
    """
    print(f"1. Extracting keypoints from frames in {video_frames_dir}")
    keypoints_output_file = os.path.join(task_temp_dir, 'keypoints.npy')
    
    # Adapted from extract_normalized_features_from_images in run_scripts.py
    image_paths = sorted(glob.glob(os.path.join(video_frames_dir, '*.jpg'))) # or .png, etc.
    if not image_paths:
        raise FileNotFoundError(f"No frames found in {video_frames_dir}")

    keypoints_sequence = []
    model = MODELS['keypoint_extractor']
    for img_path in image_paths:
        batch_results = inference_topdown(model, img_path)
        results = merge_data_samples(batch_results)
        if hasattr(results, 'pred_instances') and results.pred_instances is not None:
            keypoints = results.pred_instances.keypoints
            keypoint_scores = (
                results.pred_instances.keypoint_scores
                if hasattr(results.pred_instances, 'keypoint_scores')
                else np.ones(keypoints.shape[:2])
            )
            kp_with_scores = np.concatenate([keypoints, keypoint_scores[..., np.newaxis]], axis=-1)

            valid_indices = [i for i in range(kp_with_scores.shape[1]) if i not in range(14, 24)]
            kp_filtered = kp_with_scores[0][valid_indices]
            keypoints_sequence.append(kp_filtered)

    if not keypoints_sequence:
        raise ValueError("No valid keypoints extracted from frames.")

    stacked_keypoints = np.stack(keypoints_sequence, axis=0)
    T, N, D = stacked_keypoints.shape
    flattened_keypoints = stacked_keypoints.reshape(T, -1)
    kp_tensor = torch.tensor(flattened_keypoints, dtype=torch.float32)
    mean = kp_tensor.mean(dim=1, keepdim=True)
    std = kp_tensor.std(dim=1, keepdim=True)
    std = torch.where(std < 1e-6, torch.tensor(1.0, device=std.device), std)
    normalized_tensor = (kp_tensor - mean) / std
    features = normalized_tensor.cpu().numpy()
    np.save(keypoints_output_file, features.reshape(T, -1))
    print(f"   Keypoints saved to {keypoints_output_file}")

    print("2. Generating gloss predictions (CTC)")
    _, input_dim = np.load(keypoints_output_file).shape
    # predicted_glosses = generate_ctc_predictions(
    #     features_path=keypoints_output_file,
    #     model_path=os.path.join(POC2_DIR, "checkpoints/model.pt"),
    #     input_dim=input_dim,
    #     cnn_output_dim=512, lstm_hidden_dim=384, num_encoder_layers=3
    # )
    predicted_glosses = MODELS['ctc_predictor'].predict(features_path=keypoints_output_file)
    print(f"   Predicted glosses: '{predicted_glosses}'")

    print("3. Translating glosses to text")
    # final_text = translate_gloss_to_text(
    #     gloss_sequence=predicted_glosses,
    #      model_dir=os.path.join(POC2_DIR, "flan_model"),
    # )
    final_text = MODELS['gloss_translator'].translate(gloss_sequence=predicted_glosses)
    print(f"   Final translated text: '{final_text}'")
    return final_text
