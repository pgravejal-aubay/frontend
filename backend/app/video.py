# backend/app/video.py
from flask import Blueprint, request, jsonify
import os
import threading
import uuid
from app.tasks import tasks, translate_video_task
from app.auth import token_required
import shutil

bp = Blueprint('video', __name__)

UPLOAD_FOLDER = 'uploads'
    
@bp.route('/upload', methods=['POST'])
def upload_video(current_user = None):
    try:
        name = current_user.name if current_user != None else "Guest"
        file = request.files['video']
        target_lang = request.form.get('targetLang') 

        if file.filename == '':
            return jsonify({'message': 'No selected file'}), 400
        
        if target_lang == '':
            return jsonify({'message': 'No target language'}),400

        if file:
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            file_path = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(file_path)

            print(f"File '{file.filename}' received from user {name}. Target language: {target_lang}")

            task_id = str(uuid.uuid4())
            tasks[task_id] = {'status': 'pending', 'name': name}

            # ✅ Passer la langue cible à la tâche
            thread = threading.Thread(target=translate_video_task, args=(task_id, file_path, target_lang))
            thread.start()

            return jsonify({'message': 'Upload successful, processing started.', 'task_id': task_id}), 202
    except Exception as e:
        print("Erreur :", e)
        try:
            shutil.rmtree(UPLOAD_FOLDER)
        except Exception as e:
                print(f"Erreur when clean up temps files : {e}")
        return jsonify({'message': 'Video not found'}), 404
