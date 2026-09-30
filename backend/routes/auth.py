import hashlib
from flask import Blueprint, request, jsonify
from models.database import execute_query

auth_bp = Blueprint('auth', __name__)

DEMO_USERS = {
    "admin@landguard.ai": {
        "password": "admin123",
        "name": "District Administrator",
        "role": "Administrator",
        "department": "Dakshina Kannada District Collectorate",
        "avatarInitials": "DA"
    },
    "officer@landguard.ai": {
        "password": "officer123",
        "name": "Land Acquisition Officer",
        "role": "Land Officer",
        "department": "Special Land Acquisition Cell",
        "avatarInitials": "LA"
    }
}

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required."}), 400

    # 1. Check MySQL Database
    sql = "SELECT id, name, email, password_hash, role, department FROM users WHERE LOWER(email) = %s"
    user_db = execute_query(sql, (email,), fetchone=True)

    if user_db:
        # Check password hash (SHA256) or plain text comparison
        input_hash = hashlib.sha256(password.encode()).hexdigest()
        if user_db['password_hash'] in (input_hash, password):
            initials = ''.join([w[0].upper() for w in user_db['name'].split()[:2]]) or 'US'
            return jsonify({
                "success": True,
                "user": {
                    "email": user_db['email'],
                    "name": user_db['name'],
                    "role": user_db['role'],
                    "department": user_db['department'],
                    "avatarInitials": initials,
                    "loggedIn": True
                }
            }), 200

    # 2. Fallback to Demo Users if DB is unpopulated or offline
    if email in DEMO_USERS and DEMO_USERS[email]['password'] == password:
        demo_user = DEMO_USERS[email]
        return jsonify({
            "success": True,
            "user": {
                "email": email,
                "name": demo_user['name'],
                "role": demo_user['role'],
                "department": demo_user['department'],
                "avatarInitials": demo_user['avatarInitials'],
                "loggedIn": True
            }
        }), 200

    return jsonify({"success": False, "message": "Invalid email or password. Use admin@landguard.ai / admin123."}), 401
