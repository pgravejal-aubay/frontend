# backend/app/ai_pipeline.py
import os
import glob
import numpy as np
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from mmpose.apis import inference_topdown, init_model
from mmpose.structures import merge_data_samples
from huggingface_hub import hf_hub_download

from .POC2.generate_ctc_predictions import CTCPredictor
from .POC2.translate_glosses import GlossTranslator

APP_DIR = os.path.dirname(os.path.abspath(__file__)) 
POC2_DIR = os.path.join(APP_DIR, 'POC2')
model_name = "facebook/nllb-200-distilled-600M"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

class TaskCancelledError(Exception):
    pass

# Dictionnaire de correspondance des langues (codes ISO NLLB)
lang_codes = {"fr": "fra_Latn","en": "eng_Latn","de": "deu_Latn","es": "spa_Latn"}

targetLangMapping = {
    "fr": "Français",
    "en": "English",
    "de": "German",
}

# Dictionary to hold pre-loaded models
MODELS = {}

# L'identifiant de votre dépôt sur Hugging Face
HF_REPO_ID = "pgravejal-innov/sign-language-translator-models"

def load_models():
    """Load all AI models into memory only once."""
    print("Pre-loading AI models from Hugging Face...")
    device = 'cuda:0' if torch.cuda.is_available() else 'cpu'

    # 1. Keypoint Extraction Model (MMPose)
    # Les fichiers de config peuvent rester dans le code Git, car ils sont petits.
    config_path = os.path.join(POC2_DIR, 'MMPose/config/wholebody/rtmpose-l_8xb32-270e_coco-ubody-wholebody-384x288.py')
    
    # On télécharge le checkpoint
    print(f"Downloading MMPose checkpoint from {HF_REPO_ID}...")
    checkpoint_path_mmpose = hf_hub_download(
        repo_id=HF_REPO_ID,
        filename="POC2/MMPose/checkpoint/wholebody/rtmpose-l_simcc-ucoco_dw-ucoco_270e-384x288-2438fd99_20230728.pth"
    )
    
    MODELS['keypoint_extractor'] = init_model(config_path, checkpoint_path_mmpose, device=device)
    print("Keypoint extractor loaded.")

    # 2. CTC Predictor
    ctc_model_config = {
        'input_dim': 369,
        'cnn_output_dim': 512, 'lstm_hidden_dim': 384, 'num_encoder_layers': 3,
        'cnn_block_dims': [128, 256, 512], 'cnn_num_blocks': [2, 2, 2],
        'cnn_kernel_size': 5, 'cnn_dropout_rate': 0.2, 'bilstm_dropout': 0.4,
    }

    # On télécharge le checkpoint CTC
    print(f"Downloading CTC model checkpoint from {HF_REPO_ID}...")
    ctc_model_path = hf_hub_download(
        repo_id=HF_REPO_ID,
        filename="POC2/checkpoints/model.pt"
    )

    # Le vocabulaire peut aussi être sur le Hub, ou rester local s'il est petit.
    # Pour l'exemple, on le laisse local, mais vous pourriez le télécharger aussi.
    ctc_vocab_path = os.path.join(POC2_DIR, "checkpoints/vocab.json")

    MODELS['ctc_predictor'] = CTCPredictor(
        model_path=ctc_model_path,
        vocab_path=ctc_vocab_path, # Gardé en local pour l'instant
        config=ctc_model_config
    )
    print("CTC Predictor loaded.")

    # 3. Gloss Translator (flan_model)
    # Pour les modèles de type transformers, on peut directement passer le repo_id !
    # C'est la méthode la plus simple.
    print(f"Loading Gloss Translator model from {HF_REPO_ID}...")
    flan_model_repo_path = f"{HF_REPO_ID}"
    # Note: Pour que cela marche, il faut que le sous-dossier `flan_model` soit à la racine du repo HF, 
    # ou alors on spécifie le sous-dossier comme ceci:
    # MODELS['gloss_translator'] = GlossTranslator(model_dir=flan_model_repo_path, subfolder="POC2/flan_model")
    # Modifions GlossTranslator pour qu'il gère ça.
    MODELS['gloss_translator'] = GlossTranslator(model_dir=flan_model_repo_path, subfolder="POC2/flan_model")
    print("Gloss Translator loaded.")


def run_translation_pipeline(video_frames_dir: str, task_temp_dir: str, targetLang: str, cancellation_check: callable) -> dict:
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
        if cancellation_check():
            raise TaskCancelledError("Cancellation detected before gloss prediction.")
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
    if cancellation_check():
        raise TaskCancelledError("Cancellation detected before gloss prediction.")
    print("2. Generating gloss predictions (CTC)")
    _, input_dim = np.load(keypoints_output_file).shape

    predicted_glosses = MODELS['ctc_predictor'].predict(features_path=keypoints_output_file)
    print(f"   Predicted glosses: '{predicted_glosses}'")
    print("3. Translating glosses to text")
    original_text = MODELS['gloss_translator'].translate(gloss_sequence=predicted_glosses)
    print(f"   Original text: '{original_text}'")
    print("4. Translating to target language")
    final_text = text_translation(original_text,targetLang)
    print(f"   Final translated text: '{final_text}'")
    targetLang = targetLangMapping.get(targetLang, targetLang)
    return {
        "original_text": original_text,
        "translated_text": final_text,
        "target_lang": targetLang,
    }

def text_translation(text, target_lang):
    print(target_lang)
    if target_lang not in lang_codes:
        raise ValueError("Language not support.")
    if target_lang == "de":
        return text
    source_lang = "deu_Latn"  # Texte source en allemand
    target_lang_code = lang_codes[target_lang]
    tokenizer.src_lang = source_lang
    encoded = tokenizer(text, return_tensors="pt")
    generated_tokens = model.generate(
        **encoded,
        forced_bos_token_id=tokenizer.convert_tokens_to_ids(target_lang_code)
    )
    translated = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)
    return translated[0]
