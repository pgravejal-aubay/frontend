pip install Flask Flask-SQLAlchemy Flask-Migrate Flask-CORS Werkzeug python-dotenv PyJWT bcrypt

# Dans backend/app : 
export FLASK_APP=run.py

flask db init  # Only run once to create the migrations folder
flask db migrate -m "Initial user table"
flask db upgrade # Applies the migration to the database