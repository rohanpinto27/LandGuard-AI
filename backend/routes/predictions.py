import json
from flask import Blueprint, request, jsonify
from services.risk_service import calculate_delay_risk
from models.database import execute_query

predictions_bp = Blueprint('predictions', __name__)

@predictions_bp.route('/predict', methods=['POST'])
def predict_risk():
    data = request.get_json() or {}

    # 1. Compute dynamic risk analysis using risk service
    result = calculate_delay_risk(data)

    # 2. Persist prediction log in MySQL if DB connection available
    try:
        sql = """
        INSERT INTO predictions (delay_probability, risk_category, confidence, prediction_method, risk_factors, recommendations)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        execute_query(
            sql,
            (
                result["delay_probability"],
                result["risk_category"],
                result["confidence"],
                result["prediction_method"],
                json.dumps(result["risk_factors"]),
                json.dumps(result["recommendations"])
            ),
            commit=True
        )
    except Exception as e:
        pass # Non-blocking if DB table is unpopulated

    return jsonify(result), 200
