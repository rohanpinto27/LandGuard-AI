from flask import Blueprint, request, jsonify
from models.database import execute_query

projects_bp = Blueprint('projects', __name__)

def map_project_to_frontend(p):
    """Maps SQL column names to frontend camelCase keys."""
    if not p:
        return None
    return {
        "id": p.get("project_code") or str(p.get("id")),
        "db_id": p.get("id"),
        "name": p.get("project_name"),
        "taluk": p.get("taluk"),
        "village": p.get("village"),
        "projectType": p.get("project_type"),
        "landAreaAcres": float(p.get("land_area") or 0.0),
        "affectedFamilies": p.get("affected_families") or 0,
        "compensationProgressPct": float(p.get("compensation_percentage") or 50.0),
        "rehabilitationProgressPct": float(p.get("rehabilitation_percentage") or 50.0),
        "documentationProgressPct": float(p.get("documentation_percentage") or 50.0),
        "legalDisputes": p.get("legal_disputes_count", p.get("legal_disputes", 0)),
        "approvalStatus": p.get("approval_status") or "Approved",
        "possessionStatus": p.get("possession_status") or "In Progress",
        "stakeholderResponsiveness": p.get("stakeholder_responsiveness") or "Medium",
        "projectDurationMonths": 24,
        "delayProbabilityPct": p.get("delay_probability") or 50,
        "riskLevel": p.get("risk_level") or "MEDIUM",
        "status": p.get("status") or "Active Monitoring",
        "latitude": float(p.get("latitude") or 12.8702),
        "longitude": float(p.get("longitude") or 74.8806)
    }

@projects_bp.route('/projects', methods=['GET'])
def get_projects():
    search = request.args.get('search', '').strip()
    taluk = request.args.get('taluk', 'ALL').strip()
    risk = request.args.get('riskLevel', request.args.get('risk', 'ALL')).strip()

    sql = "SELECT p.*, (SELECT COUNT(*) FROM legal_disputes l WHERE l.project_id = p.id) as legal_disputes_count FROM projects p WHERE 1=1"
    params = []

    if search:
        sql += " AND (LOWER(p.project_code) LIKE %s OR LOWER(p.project_name) LIKE %s OR LOWER(p.village) LIKE %s OR LOWER(p.taluk) LIKE %s)"
        q = f"%{search.lower()}%"
        params.extend([q, q, q, q])

    if taluk and taluk != 'ALL':
        sql += " AND p.taluk = %s"
        params.append(taluk)

    if risk and risk != 'ALL':
        sql += " AND p.risk_level = %s"
        params.append(risk)

    sql += " ORDER BY p.id ASC"

    rows = execute_query(sql, tuple(params))
    if rows is not None:
        projects = [map_project_to_frontend(r) for r in rows]
        return jsonify(projects), 200

    return jsonify([]), 200

@projects_bp.route('/projects/<project_id>', methods=['GET'])
def get_project(project_id):
    sql = "SELECT p.*, (SELECT COUNT(*) FROM legal_disputes l WHERE l.project_id = p.id) as legal_disputes_count FROM projects p WHERE p.project_code = %s OR p.id = %s"
    row = execute_query(sql, (project_id, project_id), fetchone=True)

    if row:
        project_data = map_project_to_frontend(row)
        
        # Add timeline, xaiFactors, recommendations for detail view
        project_data["timeline"] = [
            { "stage": "Project Approval", "status": "completed", "date": "2025-02-14" },
            { "stage": "Land Identification", "status": "completed", "date": "2025-04-10" },
            { "stage": "Notification", "status": "completed", "date": "2025-07-22" },
            { "stage": "Compensation Processing", "status": "delayed" if project_data["delayProbabilityPct"] > 60 else "completed", "date": "2026-01-15" },
            { "stage": "Legal Clearance", "status": "delayed" if project_data["legalDisputes"] > 2 else "completed", "date": "2026-03-30" },
            { "stage": "Possession Handover", "status": "pending", "date": "Est. Nov 2026" },
            { "stage": "Rehabilitation", "status": "pending", "date": "Est. Jan 2027" }
        ]

        project_data["xaiFactors"] = [
            { "factor": "Compensation Disbursal", "impact": "High Impact" if project_data["compensationProgressPct"] < 50 else "Low Impact", "weightPct": int(100 - project_data["compensationProgressPct"]), "color": "#DC2626" if project_data["compensationProgressPct"] < 50 else "#16A34A" },
            { "factor": "Pending Legal Suits", "impact": "High Impact" if project_data["legalDisputes"] > 2 else "Low Impact", "weightPct": min(project_data["legalDisputes"] * 15, 90), "color": "#DC2626" if project_data["legalDisputes"] > 2 else "#16A34A" },
            { "factor": "Rehabilitation Layout", "impact": "Medium Impact", "weightPct": int(100 - project_data["rehabilitationProgressPct"]), "color": "#F59E0B" }
        ]

        project_data["recommendations"] = [
            { "priority": "URGENT" if project_data["compensationProgressPct"] < 50 else "HIGH", "title": "Accelerate Pending Compensation Disbursal", "desc": f"Allocate Revenue Collector desk to clear pending claims for {project_data['name']}." },
            { "priority": "HIGH", "title": "Prioritize Legal Dispute Settlement", "desc": f"Establish out-of-court settlement panel for {project_data['legalDisputes']} active court suits." }
        ]

        return jsonify(project_data), 200

    return jsonify({"error": "Project not found"}), 404

@projects_bp.route('/projects', methods=['POST'])
def create_project():
    data = request.get_json() or {}
    code = data.get('project_code', f"DK-LA-0{data.get('id', '99')}")
    name = data.get('project_name', data.get('name', 'New Infrastructure Project'))
    p_type = data.get('project_type', data.get('projectType', 'Infrastructure'))
    taluk = data.get('taluk', 'Mangaluru')
    village = data.get('village', 'Central')
    land_area = data.get('land_area', data.get('landAreaAcres', 10.0))
    families = data.get('affected_families', data.get('affectedFamilies', 10))

    sql = """
    INSERT INTO projects (project_code, project_name, project_type, taluk, village, land_area, affected_families, delay_probability, risk_level)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    res = execute_query(sql, (code, name, p_type, taluk, village, land_area, families, 50, 'MEDIUM'), commit=True)
    if res:
        return jsonify({"success": True, "message": "Project created successfully", "project_code": code}), 201
    return jsonify({"error": "Failed to create project"}), 500

@projects_bp.route('/projects/<project_id>', methods=['PUT'])
def update_project(project_id):
    data = request.get_json() or {}
    comp = data.get('compensation_percentage', data.get('compensationProgressPct'))
    rehab = data.get('rehabilitation_percentage', data.get('rehabilitationProgressPct'))
    status = data.get('status')

    sql = "UPDATE projects SET status = COALESCE(%s, status) WHERE project_code = %s OR id = %s"
    res = execute_query(sql, (status, project_id, project_id), commit=True)
    if res:
        return jsonify({"success": True, "message": "Project updated successfully"}), 200
    return jsonify({"error": "Failed to update project"}), 500
