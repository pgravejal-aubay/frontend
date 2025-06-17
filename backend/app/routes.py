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

