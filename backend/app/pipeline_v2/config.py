# backend/app/pipeline_v2/config.py
import torch
import math
import os

# --- Define a base directory for this config file's location ---
# This will be .../backend/app/pipeline_v2/
PIPELINE_V2_DIR = os.path.abspath(os.path.dirname(__file__))

# --- Define the assets directory within pipeline_v2 ---
ASSETS_DIR = os.path.join(PIPELINE_V2_DIR, 'assets')

# --- Data (These typically point to the larger PHOENIX dataset location, might remain absolute) ---
# If your PHOENIX dataset is NOT inside pipeline_v2/assets, these absolute paths are fine.
# If you intend to move a subset of PHOENIX data into pipeline_v2/assets for portability,
# then you would change these to be relative to ASSETS_DIR.
# For now, assuming PHOENIX data is external:
DATA_PATH = "/mnt/c/Users/pgravejal/data/phoenix-2014-T.v3/PHOENIX-2014-T-release-v3/PHOENIX-2014-T/"
VIDEO_PATH = os.path.join(DATA_PATH, "features/fullFrame-210x260px/")
ANNOTATION_PATH = os.path.join(DATA_PATH, "annotations/manual/")
# KEYPOINT_PATH is where extract_keypoints.py *saves* its output.
# If you want these V2-specific keypoints to be stored within pipeline_v2/assets, change this:
# KEYPOINT_PATH = os.path.join(ASSETS_DIR, "extracted_keypoints_phoenix/")
# Otherwise, the absolute path is fine if it's a shared/external location.
KEYPOINT_PATH = "/mnt/c/Users/pgravejal/data/phoenix-2014-T-keypoints/"


# --- Preprocessing (Usually no path changes here) ---
VIDEO_TYPE = "features"  # "features" means frames are already extracted as images
NUM_FRAMES = 64          # Number of frames to sample per video for model input
IMG_SIZE = (224, 224)
RGB_MEAN = [0.485, 0.456, 0.406]
RGB_STD = [0.229, 0.224, 0.225]

# --- Vocabulary ---
# Path to the gloss vocabulary file FOR THIS PIPELINE (V2)
# Assuming it's in pipeline_v2/assets/data/
VOCAB_PATH_GLOSS = os.path.join(ASSETS_DIR, "data", "phoenix_gloss.vocab") # MODIFIED
UNK_TOKEN = "<unk>"
PAD_TOKEN = "<pad>"
SOS_TOKEN = "<sos>"
EOS_TOKEN = "<eos>"
CTC_BLANK_TOKEN = "<blank>"
CTC_BLANK_IDX = 0 # Must be 0 for PyTorch CTCLoss
PAD_IDX = 1       # Typically 1, will be confirmed by Vocabulary class

# --- Core Model Dimensions (SLR Model) ---
ENCODER_OUTPUT_DIM = 512
ENCODER_PROJ_DROPOUT = 0.2
SPATIAL_CNN_FEATURES_DIM = 512
WINDOW_SIZE = 8
WINDOW_STRIDE = 4
NUM_WINDOWS = math.floor((NUM_FRAMES - WINDOW_SIZE) / WINDOW_STRIDE) + 1 # Requires NUM_FRAMES, WINDOW_SIZE, WINDOW_STRIDE
RGB_WINDOW_CNN_OUTPUT_DIM = 256
RGB_WINDOW_LSTM_HIDDEN_DIM = 256
RGB_WINDOW_FINAL_DIM = 256
RGB_WINDOW_LSTM_DROPOUT = 0.15
KP_WINDOW_CNN_OUTPUT_DIM = 256
KP_WINDOW_LSTM_HIDDEN_DIM = 256
KP_WINDOW_FINAL_DIM = 256
KP_WINDOW_LSTM_DROPOUT = 0.15
GLOBAL_LSTM_HIDDEN_DIM = 512
GLOBAL_LSTM_NUM_LAYERS = 3
GLOBAL_LSTM_DROPOUT = 0.2
KEYPOINT_INPUT_DIM = 381 # (33 + 2*21 + 52) * 3
NUM_KEYPOINTS = 127 # (33 + 2*21 + 52)
KEYPOINT_COORDS = 3

VIDEO_STREAM_CTC_WEIGHT = 1.0
KEYPOINT_STREAM_CTC_WEIGHT = 1.0
JOINT_HEAD_CTC_WEIGHT = 1.0
AUX_VIDEO_CTC_WEIGHT = 0.3
AUX_KEYPOINT_CTC_WEIGHT = 0.3
SELF_DISTILLATION_WEIGHT = 1.0
LATERAL_CONNECTION_DIM = 256
AUX_HEAD_HIDDEN_DIM = 256


# --- Training (SLR Model) ---
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
EPOCHS = 100
BATCH_SIZE = 4
LEARNING_RATE = 1e-4
WEIGHT_DECAY = 1e-5
CLIP_GRAD_NORM = 2.0
WARMUP_EPOCHS = 5

# --- Checkpointing (SLR Model) ---
# Directory where SLR checkpoints ARE STORED/LOADED FROM for this pipeline (V2)
CHECKPOINT_DIR_SLR = os.path.join(ASSETS_DIR, "checkpoints_slr_ctc") # MODIFIED base directory
# Filename of the best SLR model you provided
BEST_MODEL_NAME_SLR = "twostream_best_epoch_067_wer31.12.pth" # UPDATED based on your image
# Full path to the best SLR model checkpoint
BEST_SLR_MODEL_PATH = os.path.join(CHECKPOINT_DIR_SLR, BEST_MODEL_NAME_SLR) # ADDED for clarity

# --- Debugging ---
DEBUG_MODE = False
DEBUG_BATCHES_PER_EPOCH = 5


# ======================================================================
# <<< Sign Language Translation (SLT) Model Configuration for V2 >>>
# ======================================================================
TRANSLATOR_MODEL_NAME = "t5-base" # Hugging Face model identifier or path to a local T5 model
T5_PREFIX_GLOSS_TO_GERMAN = "translate Gloss to German: "

MAX_GLOSS_SEQ_LEN = 70 # Max sequence length for tokenized glosses fed to T5
MAX_TEXT_SEQ_LEN = 70  # Max sequence length for tokenized German text output by T5

# VOCAB_PATH_TEXT is not strictly needed if you use T5's own tokenizer for German text.
# If you had a custom text vocab, it would be:
# VOCAB_PATH_TEXT = os.path.join(ASSETS_DIR, "data", "phoenix_spoken_text_v2.vocab")


# --- Training (Translation Model) ---
TRANSLATOR_EPOCHS = 30
TRANSLATOR_BATCH_SIZE = 8
TRANSLATOR_LEARNING_RATE = 5e-5
TRANSLATOR_WEIGHT_DECAY = 0.01
TRANSLATOR_WARMUP_EPOCHS = 2
TRANSLATOR_CLIP_GRAD_NORM = 1.0
TRANSLATOR_BEAM_SIZE = 4

# --- Checkpointing (Translation Model) ---
# Directory where Translator checkpoints ARE STORED/LOADED FROM for this pipeline (V2)
CHECKPOINT_DIR_TRANSLATOR = os.path.join(ASSETS_DIR, "checkpoints_translator_t5") # MODIFIED base directory
# Filename of the best Translator model you provided
BEST_MODEL_NAME_TRANSLATOR = "translator_checkpoint_epoch_019.pth" # UPDATED based on your image
# Full path to the best Translator model checkpoint
BEST_TRANSLATOR_MODEL_PATH = os.path.join(CHECKPOINT_DIR_TRANSLATOR, BEST_MODEL_NAME_TRANSLATOR) # ADDED

# --- Evaluation (Translation Model) ---
# Metrics: BLEU, METEOR, ROUGE

PRINT_CONFIG_SLR = False

# --- Printout (Optional, good for debugging config loading) ---
if PRINT_CONFIG_SLR:
    print("-" * 30)
    print("Pipeline V2 Configuration Loaded (SLR - CTC):")
    # ... (print relevant SLR V2 config variables)
    print(f"  V2 SLR Checkpoint: {BEST_SLR_MODEL_PATH}")
    print(f"  V2 Gloss Vocab: {VOCAB_PATH_GLOSS}")
    print("-" * 30)

print("=" * 30)
print("Pipeline V2 TRANSLATION MODEL CONFIG:")
print(f"  Translator Base Model: {TRANSLATOR_MODEL_NAME}")
# ... (print relevant Translator V2 config variables)
print(f"  V2 Translator Checkpoint: {BEST_TRANSLATOR_MODEL_PATH}")
print("=" * 30)