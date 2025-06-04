# backend/run.py
from app import create_app, db
from app.models import User

app = create_app()

if __name__ == '__main__':
    # Run on 0.0.0.0 to be accessible from your mobile device on the same network
    app.run(host='0.0.0.0', port=5000, debug=True)