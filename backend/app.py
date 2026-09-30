# ==============================================================================
# LANDGUARD AI - Flask REST API Entry Point
# Predictive Land Acquisition Risk Analytics | Dakshina Kannada District
# ==============================================================================

from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from models.database import check_db_status

# Import Route Blueprints
from routes.auth import auth_bp
from routes.dashboard import dashboard_bp
from routes.projects import projects_bp
from routes.predictions import predictions_bp
from routes.alerts import alerts_bp
from routes.reports import reports_bp

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for frontend cross-origin requests
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register Blueprints under /api prefix
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(dashboard_bp, url_prefix='/api')
app.register_blueprint(projects_bp, url_prefix='/api')
app.register_blueprint(predictions_bp, url_prefix='/api')
app.register_blueprint(alerts_bp, url_prefix='/api')
app.register_blueprint(reports_bp, url_prefix='/api')

@app.route('/api/health', methods=['GET'])
def health_check():
    db_ok = check_db_status()
    return jsonify({
        "status": "online",
        "service": "LandGuard AI Flask REST API",
        "district": "Dakshina Kannada • Karnataka",
        "database": "connected" if db_ok else "fallback_standalone",
        "version": "1.0.0-academic"
    }), 200

if __name__ == '__main__':
    print(f"============================================================")
    print(f" LANDGUARD AI — FLASK BACKEND SERVER RUNNING")
    print(f" URL: http://127.0.0.1:{Config.PORT}")
    print(f" API Health: http://127.0.0.1:{Config.PORT}/api/health")
    print(f" Database: {'Connected (MySQL)' if check_db_status() else 'Fallback Standalone Mode'}")
    print(f"============================================================")
    app.run(host='127.0.0.1', port=Config.PORT, debug=Config.DEBUG)
