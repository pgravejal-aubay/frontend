# backend/app/video.py
from flask import Blueprint, request, jsonify, current_app # Added current_app
import os
import threading
import uuid
from app.tasks import tasks, translate_video_task, translate_video_task_v2 # Import both tasks
from app.auth import token_required
import shutil

bp = Blueprint('video', __name__)

# UPLOAD_FOLDER will be taken from app.config['UPLOAD_FOLDER']
    
@bp.route('/upload', methods=['POST'])
def upload_video(current_user = None):
    name = current_user.name if current_user != None else "Guest"
    upload_folder_base = current_app.config['UPLOAD_FOLDER'] # Get from app config
    os.makedirs(upload_folder_base, exist_ok=True)

    try:
        if 'video' not in request.files:
            return jsonify({'message': 'No video file part in the request'}), 400
        
        target_lang = request.form.get('targetLang')
        file = request.files['video']
        pipeline_choice = request.form.get('pipeline_choice', 'v1') # Default to v1

        if file.filename == '':
            return jsonify({'message': 'No selected file'}), 400
        
        if target_lang == '':
            return jsonify({'message': 'No target language'}),400

        if file:
            task_id = str(uuid.uuid4())
            # Create a unique directory for this task's files
            task_specific_dir = os.path.join(upload_folder_base, task_id)
            os.makedirs(task_specific_dir, exist_ok=True)
            
            # Save the video inside the task-specific directory
            # Use a consistent name or original, ensure it's secure
            original_filename = file.filename 
            # You might want to secure the filename further, e.g., Werkzeug's secure_filename
            filename = f"video.{original_filename.rsplit('.',1)[-1]}" if '.' in original_filename else "video.mp4"
            file_path = os.path.join(task_specific_dir, filename)
            file.save(file_path)
            
            print(f"File '{file.filename}' received from user {name}, saved to {file_path}.")

            tasks[task_id] = {'status': 'pending', 'name': name, 'pipeline': pipeline_choice}

            if pipeline_choice == 'v2':
                thread = threading.Thread(target=translate_video_task_v2, args=(task_id, file_path, target_lang))
                print(f"Starting Pipeline V2 for task {task_id}")
            else: # Default or 'v1'
                thread = threading.Thread(target=translate_video_task, args=(task_id, file_path, target_lang))
                print(f"Starting Pipeline V1 for task {task_id}")
            thread.start()

            return jsonify({'message': f'Upload successful, processing with {pipeline_choice} started.', 'task_id': task_id}), 202
        else:
            return jsonify({'message': 'File object is not valid'}), 400
            
    except KeyError as e: # For missing 'video' in request.files
        current_app.logger.error(f"KeyError during video upload: {e}")
        return jsonify({'message': f'Missing "video" part in form-data. Error: {e}'}), 400
    except Exception as e:
        current_app.logger.error(f"Error during video upload: {e}")
        # Consider more specific error logging here
        import traceback
        traceback.print_exc()
        return jsonify({'message': f'An unexpected error occurred during upload: {str(e)}'}), 500