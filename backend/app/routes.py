# backend/app/routes.py
from flask import Blueprint, jsonify, current_app
import os
from app.tasks import tasks
from app.auth import token_required

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    return "Welcome to the main API!"

@bp.route('/api/protected', methods=['GET'])
@token_required # Protect this route
def protected_route(current_user): # current_user is passed by the decorator
    return jsonify({'message': f'Hello, {current_user.username}! This is a protected resource.'})


# @bp.route('/api/upload', methods=['POST'])
# @token_required  # Protect the route
# def upload_video(current_user):
#     if 'video' not in request.files:
#         return jsonify({'message': 'No video file part'}), 400

#     file = request.files['video']
#     if file.filename == '':
#         return jsonify({'message': 'No selected file'}), 400

#     if file:
#         # Here, you should save the file to disk or cloud storage
#         # e.g., file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
#         print(f"File '{file.filename}' received from user {current_user.username}.")

#         # Create a new task
#         task_id = str(uuid.uuid4())
#         tasks[task_id] = {'status': 'pending', 'user': current_user.username}

#         # Start background processing
#         thread = threading.Thread(target=translate_video_task, args=(task_id,))
#         thread.start()

#         # Respond immediately with the task ID
#         return jsonify({'message': 'Upload successful, processing started.', 'task_id': task_id}), 202

@bp.route('/api/upload', methods=['POST'])
@token_required
def upload_video(current_user):
    if 'video' not in request.files:
        return jsonify({'message': 'No video file part'}), 400

    file = request.files['video']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400

    if file:
        task_id = str(uuid.uuid4())
        
        task_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], task_id)
        os.makedirs(task_dir, exist_ok=True)
        
        video_path = os.path.join(task_dir, file.filename)
        file.save(video_path)
        print(f"File '{file.filename}' saved to {video_path} for task {task_id}.")

        tasks[task_id] = {'status': 'pending', 'user': current_user.username}
        thread = threading.Thread(target=translate_video_task, args=(task_id, video_path))
        thread.start()

        return jsonify({'message': 'Upload successful, processing started.', 'task_id': task_id}), 202
    
@bp.route('/api/task/status/<task_id>', methods=['GET'])
@token_required
def get_task_status(current_user, task_id):
    task = tasks.get(task_id)
    if not task:
        return jsonify({'message': 'Task not found'}), 404
    
    if task.get('user') != current_user.username:
        return jsonify({'message': 'Unauthorized to view this task'}), 403

    return jsonify(task), 200

@bp.route('/api/task/cancel/<task_id>', methods=['POST'])
@token_required
def cancel_task(current_user, task_id):
    task = tasks.get(task_id)
    if not task:
        return jsonify({'message': 'Task not found'}), 404

    if task.get('user') != current_user.username:
        return jsonify({'message': 'Unauthorized to cancel this task'}), 403

    if task['status'] == 'processing':
        task['cancel_requested'] = True
        return jsonify({'message': 'Cancellation requested.'}), 200

    return jsonify({'message': 'Task cannot be cancelled at this stage.'}), 400
