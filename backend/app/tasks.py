# backend/app/tasks.py
import os
import cv2
from .ai_pipeline import run_translation_pipeline, TaskCancelledError
from flask import current_app
import shutil
from flask import current_app # Used for logging or accessing app config if needed, not strictly for paths here

# Import for Pipeline V1
from .ai_pipeline import run_translation_pipeline
from .pipeline_v2.pipeline_v2_orchestrator import run_translation_pipeline_v2
import shutil

tasks = {}
UPLOAD_FOLDER = 'uploads'
def translate_video_task(task_id: str, video_path: str,targetLang: str):

# Import for Pipeline V2

# The UPLOAD_FOLDER is configured in app/__init__.py and used by video.py
# to create task-specific subdirectories. The 'video_path' passed to
# these task functions will already be a path like:
# instance/uploads/<task_id>/video.mp4
# So, os.path.dirname(video_path) will give the task-specific temp directory.
    """
    Runs the complete Pipeline V1: frame extraction THEN translation.
    """
    task = tasks.get(task_id)
    if not task:
        print(f"Task {task_id} (V1) not found in dictionary, thread is aborting.")
        # Optionally, log to current_app.logger if available and configured
        # current_app.logger.warning(f"Task {task_id} (V1) not found, aborting.")
        return

    task['status'] = 'processing'
    
    # task_temp_dir is the unique directory for this specific task's files
    task_temp_dir = os.path.dirname(video_path)
    cancellation_checker = lambda: task.get('cancel_requested', False)
    
    # Frames for Pipeline V1 will be stored in a 'frames' subdirectory within the task_temp_dir
    frames_dir_v1 = os.path.join(task_temp_dir, 'frames_v1') # Make it explicit for V1
    os.makedirs(frames_dir_v1, exist_ok=True)
    try:
        print(f"Task {task_id} (V1): Starting frame extraction from {video_path} into {frames_dir_v1}")
        vidcap = cv2.VideoCapture(video_path)
        success, image = vidcap.read()
        count = 0
        while success:
            if cancellation_checker():
                raise TaskCancelledError("Cancelled during frame extraction.")
            
            cv2.imwrite(os.path.join(frames_dir_v1, f"frame{count:05d}.jpg"), image)
            success, image = vidcap.read()
            count += 1
        
        if count == 0:
            raise ValueError("Pipeline V1: Could not extract any frames from the video. It might be corrupted or in an unsupported format.")
        
        print(f"Task {task_id} (V1): Successfully extracted {count} frames to {frames_dir_v1}")

        result = run_translation_pipeline(frames_dir_v1, task_temp_dir, targetLang, cancellation_checker)

        task['status'] = 'completed'
        task['result'] = result
        print(f"✅ Pipeline V1 Processing completed for task {task_id}. Result: '{result}'")

    except TaskCancelledError:
        task['status'] = 'cancelled'
        print(f"🛑 Task {task_id} was cancelled by the user.")
        # Call Pipeline V1's translation function


    except Exception as e:
        task['status'] = 'failed'
        task['error'] = str(e)
        print(f"❌ Pipeline V1 Processing FAILED for task {task_id}. Error: {e}")
        # current_app.logger.error(f"Pipeline V1 Processing FAILED for task {task_id}: {e}", exc_info=True)
        
    finally:
        try:
            if os.path.exists(task_temp_dir):
                 shutil.rmtree(task_temp_dir)
                 print(f"Cleaned up Pipeline V1 temp directory: {task_temp_dir} for task {task_id}")
        except Exception as e_clean:
            print(f"Error during Pipeline V1 cleanup for task {task_id}: {e_clean}")
            # current_app.logger.error(f"Error during V1 cleanup for task {task_id}: {e_clean}")


def translate_video_task_v2(task_id: str, video_path: str,targetLang: str):
    """
    Runs the complete Pipeline V2: frame extraction THEN translation.
    """
    task = tasks.get(task_id)
    if not task:
        print(f"Task {task_id} (V2) not found in dictionary, thread is aborting.")
        # current_app.logger.warning(f"Task {task_id} (V2) not found, aborting.")
        return

    task['status'] = 'processing'
    
    # task_temp_dir is the unique directory for this specific task's files
    task_temp_dir = os.path.dirname(video_path)
    
    # Frames for Pipeline V2 will be stored in a 'frames_v2' subdirectory
    frames_dir_v2 = os.path.join(task_temp_dir, 'frames_v2')
    os.makedirs(frames_dir_v2, exist_ok=True)

    try:
        print(f"Task {task_id} (V2): Starting frame extraction from {video_path} into {frames_dir_v2}")
        vidcap = cv2.VideoCapture(video_path)
        success, image = vidcap.read()
        count = 0
        while success:
            cv2.imwrite(os.path.join(frames_dir_v2, f"frame{count:05d}.jpg"), image)
            success, image = vidcap.read()
            count += 1
        
        if count == 0:
            raise ValueError("Pipeline V2: Could not extract any frames from the video. It might be corrupted or in an unsupported format.")
        
        print(f"Task {task_id} (V2): Successfully extracted {count} frames to {frames_dir_v2}")

        # Call Pipeline V2's translation function
        translated_text = run_translation_pipeline_v2(frames_dir_v2, task_temp_dir,targetLang)

        task['status'] = 'completed'
        task['result'] = {
            'translated_text': translated_text
        }
        print(f"✅ Pipeline V2 Processing completed for task {task_id}. Result: '{translated_text}'")

    except Exception as e:
        task['status'] = 'failed'
        task['error'] = str(e)
        print(f"❌ Pipeline V2 Processing FAILED for task {task_id}. Error: {e}")
        # current_app.logger.error(f"Pipeline V2 Processing FAILED for task {task_id}: {e}", exc_info=True)
        
    finally:
        # Clean up the specific temporary directory for this task
        try:
            if os.path.exists(task_temp_dir):
                 shutil.rmtree(task_temp_dir)
                 print(f"Cleaned up Pipeline V2 temp directory: {task_temp_dir} for task {task_id}")
        except Exception as e_clean:
            print(f"Error during Pipeline V2 cleanup for task {task_id}: {e_clean}")
            # current_app.logger.error(f"Error during V2 cleanup for task {task_id}: {e_clean}")