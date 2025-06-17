from flask import Blueprint, request, jsonify
import os

bp = Blueprint('video', __name__)

UPLOAD_FOLDER = 'uploads'

@bp.route('/upload', methods=['POST'])
def upload():
    try :
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        video = request.files['video']
        video_path = os.path.join(UPLOAD_FOLDER, video.filename)
        video.save(video_path)

        try:
            os.remove(video_path)
        except Exception as e:
            print(f"Erreur lors de la suppression : {e}")

        return jsonify({'message': 'Translation in progress...'}), 201
    except Exception as e:
        return jsonify({'message' : 'Video not found'}), 404