from flask import Blueprint, request, jsonify, current_app # Added current_app
from app import db
from app.models import User, SavingTranslation
import jwt

bp = Blueprint('translation', __name__)


@bp.route('/get', methods=['POST'])
def get_user_saved_translations():
    data = request.get_json()
    if not data or 'token' not in data:
        return jsonify({"message": "Token manquant dans la requête."}), 400
    token = data['token']
    try:
        payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=["HS256"])
        user_id = payload['user_id']
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "Utilisateur non trouvé."}), 404
        saved_translations = user.saved_translations.all()
        translations_data = []
        for translation in saved_translations:
            translations_data.append({
                'id': translation.id,
                'originalText': translation.original_text,
                'translatedText': translation.translate_text,
                'sourceLang': translation.source_language,
                'targetLang': translation.target_language,
            })
        return jsonify({"translations": translations_data}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token expiré."}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Token invalide."}), 401
    except Exception as e:
        current_app.logger.error(f"Erreur interne du serveur lors de la récupération des traductions sauvegardées: {e}")
        return jsonify({"message": "Erreur interne du serveur."}), 500

@bp.route('/save',methods=['POST'])
def save_user_translation():
    data = request.get_json()
    required_fields = ['token', 'original_text', 'translate_text', 'sourceLang', 'sourceLang']
    if not data or not all(field in data for field in required_fields):
        return jsonify({"message": "Données manquantes. Assurez-vous d'inclure token, original_text, translate_text, source_language, et target_language."}), 400

    token = data['token']
    original_text = data['original_text']
    translate_text = data['translate_text']
    source_language = data['sourceLang']
    target_language = data['target_lang']

    try:
        payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=["HS256"])
        user_id = payload['user_id']
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "Utilisateur non trouvé."}), 404
        new_saving_translation = SavingTranslation(
            original_text=original_text,
            translate_text=translate_text,
            source_language=source_language,
            target_language=target_language,
            user_id=user.id
        )
        db.session.add(new_saving_translation)
        db.session.commit()

        return jsonify({
            "message": "Traduction sauvegardée avec succès.",
            "translation_id": new_saving_translation.id
        }), 201

    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token expiré."}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Token invalide."}), 401
    except Exception as e:
        current_app.logger.error(f"Erreur interne du serveur lors de la sauvegarde de la traduction: {e}")
        db.session.rollback()
        return jsonify({"message": "Erreur interne du serveur."}), 500
    

@bp.route('/clear', methods=['POST'])
def clear_user_saved_translations():
    data = request.get_json()
    if not data or 'token' not in data:
        return jsonify({"message": "Token missing from request."}), 400

    token = data['token']
    try:
        payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=["HS256"])
        user_id = payload['user_id']
        print(f"User ID from token: {user_id}")
        user = User.query.get(user_id)
        print(f"User found: {user}")
        if not user:
            return jsonify({"message": "User not found."}), 404
        num_deleted = SavingTranslation.query.filter_by(user_id=user_id).delete(synchronize_session=False)

        db.session.commit()

        return jsonify({
            "message": f"{num_deleted} translations have been successfully deleted."
        }), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token expired."}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token."}), 401
    except Exception as e:
        current_app.logger.error(f"Internal server error when clearing translations: {e}")
        db.session.rollback()
        return jsonify({"message": "Internal server error."}), 500
