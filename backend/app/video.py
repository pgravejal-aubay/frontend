from flask import Blueprint, request, jsonify
import os

bp = Blueprint('video', __name__)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@bp.route('/upload', methods=['POST'])
def upload():
    if 'video' not in request.files:
        return jsonify({'message': 'Missing Video'}), 400
    video = request.files['video']
    video_path = os.path.join(UPLOAD_FOLDER, video.filename)
    video.save(video_path)
    # Ici tu peux traiter la vidéo (ex: transcription, conversion, etc.)

    # Puis supprimer le fichier
    try:
        os.remove(video_path)
        print(f"Fichier supprimé : {video_path}")
    except Exception as e:
        print(f"Erreur lors de la suppression : {e}")

    return jsonify({'message': 'Translation in progress...'}), 201
