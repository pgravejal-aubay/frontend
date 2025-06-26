# backend/app/routes.py
from flask import Blueprint, jsonify, current_app

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


    
@bp.route('/api/task/status/<task_id>', methods=['GET'])
def get_task_status(current_user = None, task_id = 0):
    name = current_user.name if current_user != None else "Guest"
    task = tasks.get(task_id)
    if not task:
        return jsonify({'message': 'Task not found'}), 404
    if task.get('name') != name:
        return jsonify({'message': 'Unauthorized to view this task'}), 403

    return jsonify(task), 200

@bp.route('/api/task/cancel/<task_id>', methods=['POST'])
def cancel_task(current_user = None, task_id = 0):
    name = current_user.name if current_user != None else "Guest"
    task = tasks.get(task_id)
    if not task:
        return jsonify({'message': 'Task not found'}), 404

    if task.get('name') != name:
        return jsonify({'message': 'Unauthorized to cancel this task'}), 403

    if task['status'] == 'processing':
        task['cancel_requested'] = True
        return jsonify({'message': 'Cancellation requested.'}), 200

    return jsonify({'message': 'Task cannot be cancelled at this stage.'}), 400
