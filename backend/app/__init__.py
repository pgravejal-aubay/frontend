# backend/app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config
import os

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__, instance_relative_config=True) # instance_relative_config=True
    app.config.from_object(config_class)

    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass # Already exists

    app.config['UPLOAD_FOLDER'] = os.path.join(app.instance_path, 'uploads')
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app) # Enable CORS for all routes, or specify origins

    from app.auth import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')

    from app.routes import bp as main_bp
    app.register_blueprint(main_bp)

    from app.video import bp as video_bp
    app.register_blueprint(video_bp, url_prefix='/video')

    with app.app_context():
        from . import ai_pipeline
        ai_pipeline.load_models()

    @app.route('/hello')
    def hello():
        return "Hello from Flask Backend (Account Management Focus)!"

    return app