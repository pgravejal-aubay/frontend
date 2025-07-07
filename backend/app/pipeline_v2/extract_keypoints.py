# extract_keypoints.py
import mediapipe as mp
import cv2
import numpy as np
import os
import pandas as pd
from tqdm import tqdm
from . import config

# --- Constants based on MediaPipe Holistic ---
NUM_POSE_LANDMARKS = 33
NUM_HAND_LANDMARKS = 21
_TOTAL_FACE_LANDMARKS_ORIGINAL = 468 # Original count from MediaPipe

# Subset of 52 key face landmarks (lips, eyebrows, eyes, nose, jaw outline)
SELECTED_FACE_LANDMARK_INDICES = sorted(list(set([
    # Lips Outer (11 points)
    61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291,
    # Lips Inner (10 points) - Reduced slightly
    78, 191, 81, 82, 13, 312, 311, 415, 308, 95, # 95 is top lip center, 13 is bottom lip center
    # Left Eyebrow (5 points)
    70, 63, 105, 66, 107,
    # Right Eyebrow (5 points)
    300, 293, 334, 296, 336,
    # Left Eye (6 points)
    33, 160, 158, 133, 153, 144,
    # Right Eye (6 points)
    263, 387, 385, 362, 380, 373,
    # Nose (4 points) - Tip, bridge top, sides
    1, 4, 5, 275, # Added 275 (side)
    # Jaw / Chin (5 points) - Reduced slightly, focusing on center and width points
    172, 136, 152, 365, 397 # Chin tip, lower jaw points
])))
NUM_SELECTED_FACE_LANDMARKS = len(SELECTED_FACE_LANDMARK_INDICES) # Should be 52 with this example

# --- Update TOTAL_LANDMARKS and NUM_COORDS ---
TOTAL_LANDMARKS = NUM_POSE_LANDMARKS + (2 * NUM_HAND_LANDMARKS) + NUM_SELECTED_FACE_LANDMARKS # UPDATED (33 + 42 + 52 = 127)
NUM_COORDS = 3 # Using x, y, z

print("-" * 30)
print(f"Keypoint Extraction Setup:")
print(f"  Pose Landmarks:       {NUM_POSE_LANDMARKS}")
print(f"  Hand Landmarks (each): {NUM_HAND_LANDMARKS}")
print(f"  Selected Face LMs:    {NUM_SELECTED_FACE_LANDMARKS} (from {_TOTAL_FACE_LANDMARKS_ORIGINAL} original)")
print(f"  Total Landmarks/Frame: {TOTAL_LANDMARKS}")
print(f"  Coordinates/Landmark: {NUM_COORDS}")
print(f"  Expected Output Shape: (T, {TOTAL_LANDMARKS}, {NUM_COORDS})")
print("-" * 30)


# Indices for normalization reference points (from MediaPipe Pose documentation)
# These indices are relative to the start of the landmark array (pose block)
LEFT_SHOULDER_INDEX = 11
RIGHT_SHOULDER_INDEX = 12

# --- Helper Functions ---

def extract_landmarks_from_results(results):
    """
    Extracts pose, hands, and SELECTED face landmarks into a single array.
    Output shape: (TOTAL_LANDMARKS, NUM_COORDS) where TOTAL_LANDMARKS is the new count.
    """
    # Create array based on the NEW total number of landmarks
    frame_landmarks = np.zeros((TOTAL_LANDMARKS, NUM_COORDS), dtype=np.float32)
    current_idx = 0 # Use an index to track position in the output array

    # Pose landmarks (NUM_POSE_LANDMARKS)
    if results.pose_landmarks:
        for i, lm in enumerate(results.pose_landmarks.landmark):
            if i < NUM_POSE_LANDMARKS: # Ensure we don't go out of bounds
                frame_landmarks[current_idx + i] = [lm.x, lm.y, lm.z]
    # Else: remains zeros
    current_idx += NUM_POSE_LANDMARKS

    # Left Hand landmarks (NUM_HAND_LANDMARKS)
    if results.left_hand_landmarks:
        for i, lm in enumerate(results.left_hand_landmarks.landmark):
             if i < NUM_HAND_LANDMARKS:
                frame_landmarks[current_idx + i] = [lm.x, lm.y, lm.z]
    # Else: remains zeros
    current_idx += NUM_HAND_LANDMARKS

    # Right Hand landmarks (NUM_HAND_LANDMARKS)
    if results.right_hand_landmarks:
        for i, lm in enumerate(results.right_hand_landmarks.landmark):
            if i < NUM_HAND_LANDMARKS:
                frame_landmarks[current_idx + i] = [lm.x, lm.y, lm.z]
    # Else: remains zeros
    current_idx += NUM_HAND_LANDMARKS

    # Face landmarks (Selected Subset) ---
    if results.face_landmarks:
        # Iterate through our pre-defined SELECTED indices
        for i, face_lm_idx in enumerate(SELECTED_FACE_LANDMARK_INDICES):
            if face_lm_idx < len(results.face_landmarks.landmark):
                lm = results.face_landmarks.landmark[face_lm_idx]
                # Store its x, y, and 0.0 for z in our final array at the correct position
                if current_idx + i < TOTAL_LANDMARKS:
                     frame_landmarks[current_idx + i] = [lm.x, lm.y, 0.0] # Store z as 0
            else:
                 print(f"Warning: Selected face index {face_lm_idx} out of bounds for detected landmarks.")

    return frame_landmarks


def normalize_frame_keypoints(landmarks):
    """
    Normalizes landmarks for a single frame based on shoulder points.
    Operates on the landmark array which already contains the subsampled face points.
    """
    # landmarks shape: (TOTAL_LANDMARKS, NUM_COORDS) - Where TOTAL_LANDMARKS is the NEW total (e.g., 127)
    normalized_landmarks = landmarks.copy()

    # These indices remain valid as pose is still the first block.
    if LEFT_SHOULDER_INDEX >= landmarks.shape[0] or RIGHT_SHOULDER_INDEX >= landmarks.shape[0]:
         print(f"Warning: Landmark array too small ({landmarks.shape[0]}) for shoulder indices. Returning zeros.")
         return np.zeros_like(landmarks)

    left_shoulder = landmarks[LEFT_SHOULDER_INDEX]
    right_shoulder = landmarks[RIGHT_SHOULDER_INDEX]

    # Using a small epsilon check for floating point comparisons
    epsilon = 1e-6
    if np.sum(np.abs(left_shoulder)) < epsilon or np.sum(np.abs(right_shoulder)) < epsilon:
        # print("Warning: Shoulder points not detected (all zeros), returning zero landmarks for normalization.")
        return np.zeros_like(landmarks) # Return zeros if shoulders are missing

    # 2. Calculate reference point (midpoint between shoulders)
    reference_point = (left_shoulder + right_shoulder) / 2.0

    # 3. Calculate reference distance (distance between shoulders)
    reference_distance = np.linalg.norm(left_shoulder - right_shoulder)

    # Avoid division by zero or near-zero
    if reference_distance < epsilon:
        # print("Warning: Shoulder distance too small, returning zero landmarks.")
        return np.zeros_like(landmarks) # Return zeros if distance is negligible

    # 4. Center: Subtract reference point from all landmarks
    normalized_landmarks -= reference_point

    # 5. Scale: Divide all landmarks by reference distance
    normalized_landmarks /= reference_distance

    return normalized_landmarks

# --- Main Extraction Logic ---

def process_dataset(split):
    """Processes all videos in a given split (train, dev, test)."""
    print(f"\n--- Processing split: {split} ---")

    # Get list of video names from annotation file for the split
    annotation_file = os.path.join(config.ANNOTATION_PATH, f"PHOENIX-2014-T.{split}.corpus.csv")
    try:
        df = pd.read_csv(annotation_file, sep='|')
        video_names = df['name'].unique().tolist()
        print(f"Found {len(video_names)} unique videos in {split} annotations.")
    except Exception as e:
        print(f"ERROR reading annotation file {annotation_file}: {e}")
        return

    source_frame_dir_base = os.path.join(config.VIDEO_PATH, split)
    target_keypoint_dir_base = os.path.join(config.KEYPOINT_PATH, split) # Use KEYPOINT_PATH from config

    # Initialize MediaPipe Holistic
    mp_holistic = mp.solutions.holistic
    holistic = mp_holistic.Holistic(
        static_image_mode=True, # Process frame by frame
        model_complexity=1,     # 0, 1, or 2. Higher = more accurate but slower.
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5)

    processed_count = 0
    skipped_count = 0
    error_count = 0
    already_exist_count = 0

    for video_name in tqdm(video_names, desc=f"Processing {split} videos"):
        video_frame_folder = os.path.join(source_frame_dir_base, video_name)
        target_keypoint_folder = os.path.join(target_keypoint_dir_base, video_name)
        target_keypoint_file = os.path.join(target_keypoint_folder, "keypoints.npy")

        # Skip if already processed
        if os.path.exists(target_keypoint_file):
            already_exist_count += 1
            continue

        if not os.path.isdir(video_frame_folder):
            # print(f"Warning: Frame folder not found for {video_name} at {video_frame_folder}, skipping.")
            skipped_count += 1
            continue

        frame_files = sorted([f for f in os.listdir(video_frame_folder) if f.endswith(('.png', '.jpg', '.jpeg'))])
        if not frame_files:
            # print(f"Warning: No frames found in {video_frame_folder}, skipping.")
            skipped_count += 1
            continue

        video_keypoints_normalized = [] # List to hold normalized landmarks for each frame
        frames_processed_in_video = 0

        try:
            for frame_file in frame_files:
                frame_path = os.path.join(video_frame_folder, frame_file)
                img = cv2.imread(frame_path)
                if img is None:
                    # print(f"Warning: Could not read frame {frame_path}, skipping frame.")
                    # Append zeros if a frame fails? Better to skip if normalization needs shoulders?
                    # If we append zeros here, normalize_frame_keypoints will handle it.
                    video_keypoints_normalized.append(np.zeros((TOTAL_LANDMARKS, NUM_COORDS), dtype=np.float32))
                    continue

                # Process with MediaPipe
                img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                img_rgb.flags.writeable = False # Performance boost
                results = holistic.process(img_rgb)
                img_rgb.flags.writeable = True

                # Extract *selected* landmarks for the frame
                frame_landmarks_raw = extract_landmarks_from_results(results) # Gets the (127, 3) array

                # Normalize the extracted landmarks (using shoulder points from the raw array)
                frame_landmarks_norm = normalize_frame_keypoints(frame_landmarks_raw)

                video_keypoints_normalized.append(frame_landmarks_norm)
                frames_processed_in_video += 1

            # Stack all normalized frame landmarks into a single array for the video
            if not video_keypoints_normalized or frames_processed_in_video == 0:
                 # print(f"Warning: No frames processed successfully for {video_name}, skipping save.")
                 skipped_count += 1
                 continue

            # Shape should be (T, TOTAL_LANDMARKS, NUM_COORDS), e.g. (T, 127, 3)
            final_keypoints = np.stack(video_keypoints_normalized, axis=0)

            os.makedirs(target_keypoint_folder, exist_ok=True)

            # Save the normalized keypoints
            np.save(target_keypoint_file, final_keypoints)
            processed_count += 1

        except Exception as e:
            print(f"\nERROR processing video {video_name}: {e}")
            import traceback
            traceback.print_exc() # Print full traceback for debugging
            error_count += 1
            if os.path.exists(target_keypoint_file):
                 try:
                     os.remove(target_keypoint_file)
                 except OSError:
                     pass

    holistic.close()
    print(f"--- Finished split: {split} ---")
    print(f"  Already Existed: {already_exist_count}")
    print(f"  Successfully Processed (New): {processed_count}")
    print(f"  Skipped (No frames/folder): {skipped_count}")
    print(f"  Errors during processing: {error_count}")

# --- Run Processing ---
if __name__ == "__main__":
    if not os.path.exists(config.KEYPOINT_PATH):
        os.makedirs(config.KEYPOINT_PATH, exist_ok=True)
        print(f"Created keypoint base directory: {config.KEYPOINT_PATH}")
    else:
        print(f"Using existing keypoint base directory: {config.KEYPOINT_PATH}")

    # Process train, dev, and test sets
    process_dataset("train")
    process_dataset("dev")
    process_dataset("test")

    print("\n--- Keypoint Extraction Complete (Using Selected Face Landmarks) ---")