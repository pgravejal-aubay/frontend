# backend/app/auth.py
from flask import Blueprint, request, jsonify
from app.models import User
from app import db
import jwt # PyJWT
import datetime
from functools import wraps
from flask import current_app # To access app.config

bp = Blueprint('auth', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'message': 'Token is invalid or user not found!'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('name') or not data.get('password') or not data.get('email') or not data.get('surname') or not data.get('confirmPassword'):
        return jsonify({'message': 'Missing Information'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered'}), 409
    if(data['password'] != data['confirmPassword']):
        return jsonify({'message' : 'Passwords are different'}), 400
    user = User(name=data['name'], email=data['email'], surname=data['surname'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully!'}), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing mail or password'}), 400

    user = User.query.filter_by(email=data['email']).first()

    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Invalid mail or password'}), 401

    # Create token
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24) # Token expires in 24 hours
    }, current_app.config['JWT_SECRET_KEY'], algorithm="HS256")

    return jsonify({'token': token, 'name': user.name, 'email': user.email}), 200


@bp.route('/delete', methods=['POST'])
def acount_deletion():
    data = request.get_json()
    if not data or not data.get('email'):
        return jsonify({'message': 'Cannot acces to your mail to do the deletion'}), 400
    user = User.query.filter_by(email=data['email']).first()
    if not user: 
        return jsonify({'message': 'User not found'}), 400
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'Account deleted successfully'}), 200

    

    
