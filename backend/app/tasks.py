# backend/app/tasks.py
import os
import cv2
from .ai_pipeline import run_translation_pipeline
from flask import current_app

tasks = {}

def translate_video_task(task_id: str, video_path: str):
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

        translated_text = run_translation_pipeline(frames_dir, task_temp_dir)

        task['status'] = 'completed'
        task['result'] = {
            'translated_text': translated_text
        }
        print(f"✅ Processing completed for task {task_id}. Result: {translated_text}")

    except Exception as e:
        task['status'] = 'failed'
        task['error'] = str(e)
        print(f"❌ Processing FAILED for task {task_id}. Error: {e}")
        
    finally:
        # Optional: Clean up temporary files
        pass

# Old version of translate_video_task for reference
# This version was used before the integration of the AI pipeline.
# def translate_video_task(task_id):
#     """
#     Function that simulates a long video translation process.
#     It will be executed in a separate thread.
#     """
#     task = tasks[task_id]
#     task['status'] = 'processing'
#     print(f"Starting processing for task {task_id}...")

#     # Simulate the video translation process
#     for i in range(5):
#         # Check every 1 second if a cancellation has been requested
#         if task.get('cancel_requested'):
#             task['status'] = 'cancelled'
#             print(f"Task {task_id} cancelled by the user.")
#             return
#         time.sleep(1)

#     # Processing is complete
#     task['status'] = 'completed'
#     task['result'] = {
#         'translated_text': 'This is the translated video text.',
#         'video_url': f'/results/{task_id}_translated.mp4' # Fake result URL
#     }
#     print(f"Processing completed for task {task_id}.")