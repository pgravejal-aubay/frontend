# backend/app/routes.py
from flask import Blueprint, request, jsonify
from app.auth import token_required

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    return "Welcome to the main API!"

@bp.route('/api/protected', methods=['GET'])
@token_required # Protect this route
def protected_route(current_user): # current_user is passed by the decorator
    return jsonify({'message': f'Hello, {current_user.username}! This is a protected resource.'})

@bp.route('/api/upload', methods=['POST'])
def upload():
    data = request.get_json()
    if not data or not data.get('video'):
        return jsonify({'message': 'Missing Video'}), 400
    return jsonify({'message': 'Start of processing ...'}), 201
