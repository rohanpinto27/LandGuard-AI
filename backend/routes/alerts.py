from flask import Blueprint, jsonify
from models.database import execute_query

alerts_bp = Blueprint('alerts', __name__)

@alerts_bp.route('/alerts', methods=['GET'])
def get_alerts():
    sql = """
    SELECT a.id, a.severity, p.project_code as projectID, p.project_name as projectName,
           a.message, DATE_FORMAT(a.created_at, '%%d %%b %%Y, %%h:%%i %%p') as timestamp, a.status
    FROM alerts a
    JOIN projects p ON a.project_id = p.id
    ORDER BY a.id DESC
    """
    rows = execute_query(sql)

    if rows:
        alerts_feed = []
        for r in rows:
            alerts_feed.append({
                "id": f"ALT-{r['id']}",
                "severity": r['severity'],
                "projectID": r['projectID'],
                "projectName": r['projectName'],
                "message": r['message'],
                "timestamp": r['timestamp'] or "Recently",
                "status": "Unread" if r['status'] == 'ACTIVE' else "Read"
            })
        return jsonify(alerts_feed), 200

    # Fallback default alert feed
    return jsonify([
        {
            "id": "ALT-801",
            "severity": "CRITICAL",
            "projectID": "DK-LA-008",
            "projectName": "Mangaluru Smart Logistics Hub",
            "message": "Predicted delay probability breached 85% threshold due to 11 active litigation stays.",
            "timestamp": "12 mins ago",
            "status": "Unread"
        },
        {
            "id": "ALT-802",
            "severity": "HIGH",
            "projectID": "DK-LA-001",
            "projectName": "Mangaluru Coastal Infrastructure Expansion",
            "message": "Compensation progress stuck at 48% for 45 consecutive days. Milestone overdue.",
            "timestamp": "35 mins ago",
            "status": "Unread"
        },
        {
            "id": "ALT-803",
            "severity": "HIGH",
            "projectID": "DK-LA-003",
            "projectName": "Puttur Water Infrastructure Corridor",
            "message": "New land valuation objection filed in Sub-Court by 14 landholders.",
            "timestamp": "1 hour ago",
            "status": "Unread"
        }
    ]), 200
