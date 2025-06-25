# backend/app/tasks.py
import os
import cv2
from .ai_pipeline import run_translation_pipeline
from flask import current_app
import shutil

tasks = {}
UPLOAD_FOLDER = 'uploads'
def translate_video_task(task_id: str, video_path: str,targetLang: str):
    """
    Runs the complete pipeline: frame extraction THEN translation.
    """
    task = tasks.get(task_id)
    if not task:
        print(f"Task {task_id} not found in dictionary, thread is aborting.")
        return

    task['status'] = 'processing'
    
    task_temp_dir = os.path.dirname(video_path)
    frames_dir = os.path.join(task_temp_dir, 'frames')
    os.makedirs(frames_dir, exist_ok=True)

    try:
        print(f"Task {task_id}: Starting frame extraction from {video_path}")
        vidcap = cv2.VideoCapture(video_path)
        success, image = vidcap.read()
        count = 0
        while success:
            cv2.imwrite(os.path.join(frames_dir, f"frame{count:05d}.jpg"), image)
            success, image = vidcap.read()
            count += 1
        
        if count == 0:
            raise ValueError("Could not extract any frames from the video. It might be corrupted or in an unsupported format.")
        
        print(f"Task {task_id}: Successfully extracted {count} frames to {frames_dir}")

        result = run_translation_pipeline(frames_dir, task_temp_dir,targetLang)

        task['status'] = 'completed'
        task['result'] = result
        print(f"✅ Processing completed for task {task_id}. Result: {result}")

    except Exception as e:
        task['status'] = 'failed'
        task['error'] = str(e)
        print(f"❌ Processing FAILED for task {task_id}. Error: {e}")
        
    finally:
        # Optional: Clean up temporary files
        try:
            shutil.rmtree(UPLOAD_FOLDER)
        except Exception as e:
                print(f"Erreur when clean up temps files : {e}")