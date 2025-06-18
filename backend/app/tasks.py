# backend/app/tasks.py
import time
import threading
import shutil

# In a real application, use a database or Redis.
tasks = {}
UPLOAD_FOLDER = 'uploads'
def translate_video_task(task_id):
    """
    Function that simulates a long video translation process.
    It will be executed in a separate thread.
    """
    task = tasks[task_id]
    task['status'] = 'processing'
    print(f"Starting processing for task {task_id}...")

    # Simulate a long process (e.g., 30 seconds)
    for i in range(15):
        # Check every 2 seconds if a cancellation has been requested
        if task.get('cancel_requested'):
            task['status'] = 'cancelled'
            print(f"Task {task_id} cancelled by the user.")
            try:
                shutil.rmtree(UPLOAD_FOLDER)
            except Exception as e:
                print(f"Erreur when clean up temps files : {e}")
            return
        time.sleep(2)

    # Processing is complete
    task['status'] = 'completed'
    task['result'] = {
        'translated_text': 'This is the translated video text.',
        'video_url': f'/results/{task_id}_translated.mp4' # Fake result URL
    }
    try:
        shutil.rmtree(UPLOAD_FOLDER)
    except Exception as e:
        print(f"Erreur when clean up temps files : {e}")
    print(f"Processing completed for task {task_id}.")