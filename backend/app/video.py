# backend/app/video.py
from flask import Blueprint, request, jsonify
import os
import threading
import uuid
from app.tasks import tasks, translate_video_task
from app.auth import token_required

bp = Blueprint('video', __name__)

UPLOAD_FOLDER = 'uploads'
    
@bp.route('/upload', methods=['POST'])
@token_required  # Protect the route
def upload_video(current_user):
    try:
        file = request.files['video']
        if file.filename == '':
            return jsonify({'message': 'No selected file'}), 400

        if file:
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            file_path = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(file_path)
            # Here, you should save the file to disk or cloud storage
            # e.g., file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            print(f"File '{file.filename}' received from user {current_user.username}.")

            # Create a new task
            task_id = str(uuid.uuid4())
            tasks[task_id] = {'status': 'pending', 'user': current_user.username}

            # Start background processing
            thread = threading.Thread(target=translate_video_task, args=(task_id, file_path))
            thread.start()

            # Respond immediately with the task ID
            return jsonify({'message': 'Upload successful, processing started.', 'task_id': task_id}), 202
    except Exception:
        return jsonify({'message' : 'Video not found'}), 404