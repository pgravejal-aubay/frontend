# backend/app/video.py
from flask import Blueprint, request, jsonify

bp = Blueprint('video', __name__)

@bp.route('/upload', methods=['POST'])
def upload():
    data = request.get_json()
    if not data or not data.get('video'):
        return jsonify({'message': 'Missing Video'}), 400
    return jsonify({'message': 'Translation in progress...'}), 201
