import os
import sqlite3

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'landguard.db')

def seed_database():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Drop existing tables
    tables = ['alerts', 'predictions', 'rehabilitation', 'legal_disputes', 'compensation', 'projects', 'users']
    for t in tables:
        cursor.execute(f"DROP TABLE IF EXISTS {t}")

    # 1. USERS TABLE
    cursor.execute("""
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'Land Officer',
        department TEXT DEFAULT 'Dakshina Kannada Revenue Department',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 2. PROJECTS TABLE
    cursor.execute("""
    CREATE TABLE projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_code TEXT NOT NULL UNIQUE,
        project_name TEXT NOT NULL,
        project_type TEXT NOT NULL,
        taluk TEXT NOT NULL,
        village TEXT NOT NULL,
        land_area REAL NOT NULL,
        affected_families INTEGER NOT NULL DEFAULT 0,
        start_date TEXT,
        target_date TEXT,
        status TEXT NOT NULL DEFAULT 'Active Monitoring',
        approval_status TEXT NOT NULL DEFAULT 'Approved',
        documentation_percentage REAL NOT NULL DEFAULT 50.0,
        compensation_percentage REAL NOT NULL DEFAULT 50.0,
        rehabilitation_percentage REAL NOT NULL DEFAULT 50.0,
        possession_status TEXT NOT NULL DEFAULT 'In Progress',
        stakeholder_responsiveness TEXT NOT NULL DEFAULT 'Medium',
        delay_probability INTEGER NOT NULL DEFAULT 50,
        risk_level TEXT NOT NULL DEFAULT 'MEDIUM',
        latitude REAL,
        longitude REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 3. COMPENSATION TABLE
    cursor.execute("""
    CREATE TABLE compensation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        total_amount REAL NOT NULL DEFAULT 0.0,
        paid_amount REAL NOT NULL DEFAULT 0.0,
        pending_amount REAL NOT NULL DEFAULT 0.0,
        percentage_completed REAL NOT NULL DEFAULT 0.0,
        status TEXT NOT NULL DEFAULT 'In Progress',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id)
    )
    """)

    # 4. LEGAL DISPUTES TABLE
    cursor.execute("""
    CREATE TABLE legal_disputes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        dispute_type TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'Pending',
        severity TEXT NOT NULL DEFAULT 'MEDIUM',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id)
    )
    """)

    # 5. REHABILITATION TABLE
    cursor.execute("""
    CREATE TABLE rehabilitation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        affected_families INTEGER NOT NULL DEFAULT 0,
        rehabilitated_families INTEGER NOT NULL DEFAULT 0,
        percentage_completed REAL NOT NULL DEFAULT 0.0,
        status TEXT NOT NULL DEFAULT 'In Progress',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id)
    )
    """)

    # 6. PREDICTIONS TABLE
    cursor.execute("""
    CREATE TABLE predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        delay_probability INTEGER NOT NULL,
        risk_category TEXT NOT NULL,
        confidence INTEGER NOT NULL DEFAULT 88,
        prediction_method TEXT DEFAULT 'Random Forest Classifier (Prototype Engine)',
        risk_factors TEXT,
        recommendations TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id)
    )
    """)

    # 7. ALERTS TABLE
    cursor.execute("""
    CREATE TABLE alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        alert_type TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'HIGH',
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id)
    )
    """)

    # Insert Users
    cursor.execute("""
    INSERT INTO users (name, email, password_hash, role, department) VALUES
    ('District Administrator', 'admin@landguard.ai', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'Administrator', 'Dakshina Kannada District Collectorate'),
    ('Land Acquisition Officer', 'officer@landguard.ai', 'e1c9d646b9a84a62e086f0309e4f01efc6096bf8624467d3e74be8f75ffc9502', 'Land Officer', 'Special Land Acquisition Cell')
    """)

    # Seed 48 Projects
    projects_data = [
        ('DK-LA-001', 'Mangaluru Coastal Infrastructure Expansion', 'Port & Logistics Corridor', 'Mangaluru', 'Panambur', 42.50, 86, '2025-02-14', '2027-02-14', 'Active Monitoring', 'Approved', 68.0, 48.0, 32.0, 'In Progress', 'Low', 82, 'HIGH', 12.945000, 74.815000),
        ('DK-LA-008', 'Mangaluru Smart Logistics Hub', 'Logistics Hub', 'Mangaluru', 'Baikampady', 65.00, 110, '2024-11-05', '2027-11-05', 'Active Monitoring', 'Approved', 50.0, 41.0, 28.0, 'Pending', 'Low', 89, 'HIGH', 12.961000, 74.829000),
        ('DK-LA-011', 'Surathkal IT & Hardware Park', 'Technology Park', 'Mangaluru', 'Surathkal', 32.00, 54, '2025-03-01', '2027-09-01', 'Active Monitoring', 'Approved', 55.0, 45.0, 35.0, 'Pending', 'Low', 76, 'HIGH', 12.982000, 74.802000),
        ('DK-LA-012', 'Jeppu Riverfront Promenade & Road', 'Urban Road Corridor', 'Mangaluru', 'Jeppu', 18.50, 62, '2025-04-10', '2026-10-10', 'Active Monitoring', 'Approved', 60.0, 42.0, 30.0, 'Pending', 'Low', 74, 'HIGH', 12.855000, 74.842000),
        ('DK-LA-013', 'Urwa Sub-Station Grid Power Expansion', 'Power Substation', 'Mangaluru', 'Urwa', 8.20, 12, '2025-05-15', '2026-11-15', 'Active Monitoring', 'Approved', 72.0, 65.0, 55.0, 'In Progress', 'Medium', 52, 'MEDIUM', 12.882000, 74.831000),
        ('DK-LA-014', 'Kulshekar Ring Road Feeder', 'Ring Road Expansion', 'Mangaluru', 'Kulshekar', 14.00, 28, '2025-06-01', '2027-02-01', 'Active Monitoring', 'Approved', 75.0, 68.0, 58.0, 'In Progress', 'Medium', 48, 'MEDIUM', 12.891000, 74.871000),
        ('DK-LA-015', 'Bajpe Airport Cargo Corridor', 'Airport Cargo Link', 'Mangaluru', 'Bajpe', 24.50, 38, '2025-02-20', '2027-02-20', 'Active Monitoring', 'Approved', 68.0, 60.0, 50.0, 'In Progress', 'Medium', 58, 'MEDIUM', 12.958000, 74.889000),
        ('DK-LA-016', 'Ullal Coastal Protection & Bridge', 'Coastal Protection', 'Mangaluru', 'Ullal', 16.00, 45, '2025-01-15', '2027-01-15', 'Active Monitoring', 'Approved', 65.0, 58.0, 48.0, 'In Progress', 'Medium', 61, 'MEDIUM', 12.805000, 74.851000),
        ('DK-LA-017', 'Bondel Civic Administration Layout', 'Administrative Complex', 'Mangaluru', 'Bondel', 11.20, 15, '2025-07-01', '2026-12-01', 'Active Monitoring', 'Approved', 80.0, 72.0, 62.0, 'In Progress', 'Medium', 44, 'MEDIUM', 12.910000, 74.862000),
        ('DK-LA-018', 'Gurupura River Bridge Bypass', 'Bridge & Highway', 'Mangaluru', 'Gurupura', 19.80, 26, '2025-03-10', '2027-01-10', 'Active Monitoring', 'Approved', 70.0, 64.0, 54.0, 'In Progress', 'Medium', 50, 'MEDIUM', 12.935000, 74.931000),
        ('DK-LA-019', 'Kenjar Industrial Sub-Zone', 'Industrial Estate', 'Mangaluru', 'Kenjar', 28.00, 18, '2025-01-05', '2026-07-05', 'Completed', 'Approved', 92.0, 88.0, 82.0, 'Completed', 'High', 18, 'LOW', 12.948000, 74.878000),
        ('DK-LA-020', 'Adyar Renewable Energy Substation', 'Power Substation', 'Mangaluru', 'Adyar', 9.50, 8, '2025-04-01', '2026-04-01', 'Completed', 'Approved', 94.0, 90.0, 85.0, 'Completed', 'High', 15, 'LOW', 12.871000, 74.912000),
        ('DK-LA-021', 'Haleyangadi Logistics Rail Yard', 'Rail Logistics', 'Mangaluru', 'Haleyangadi', 22.00, 16, '2025-02-10', '2026-08-10', 'On Schedule', 'Approved', 88.0, 85.0, 78.0, 'In Progress', 'High', 24, 'LOW', 13.021000, 74.795000),
        ('DK-LA-022', 'Someshwar Eco-Tourism Access Road', 'Tourism Access Road', 'Mangaluru', 'Someshwar', 7.80, 6, '2025-05-01', '2026-05-01', 'Completed', 'Approved', 95.0, 92.0, 86.0, 'Completed', 'High', 12, 'LOW', 12.789000, 74.861000),

        ('DK-LA-002', 'Bantwal Regional Connectivity Project', 'Highway & Bypass Expansion', 'Bantwal', 'B.C. Road', 28.00, 42, '2025-05-20', '2027-05-20', 'Active Monitoring', 'Approved', 84.0, 76.0, 65.0, 'In Progress', 'Medium', 45, 'MEDIUM', 12.879000, 75.032000),
        ('DK-LA-009', 'Bantwal Industrial Estate Phase 2', 'Industrial Estate', 'Bantwal', 'Mani', 38.00, 35, '2025-04-02', '2027-04-02', 'Active Monitoring', 'Approved', 70.0, 62.0, 50.0, 'In Progress', 'Medium', 56, 'MEDIUM', 12.839000, 75.105000),
        ('DK-LA-023', 'Kalladka Flyover Feeder Corridor', 'Flyover Feeder', 'Bantwal', 'Kalladka', 15.40, 48, '2025-01-15', '2027-07-15', 'Active Monitoring', 'Approved', 48.0, 38.0, 25.0, 'Pending', 'Low', 81, 'HIGH', 12.861000, 75.068000),
        ('DK-LA-024', 'Vittal Water Treatment Plant Corridor', 'Water Infrastructure', 'Bantwal', 'Vittal', 12.00, 32, '2025-03-20', '2027-03-20', 'Active Monitoring', 'Approved', 52.0, 44.0, 30.0, 'Pending', 'Low', 73, 'HIGH', 12.768000, 75.102000),
        ('DK-LA-025', 'Farangipete Riverbank Protection Works', 'River Protection', 'Bantwal', 'Farangipete', 9.60, 20, '2025-06-10', '2026-12-10', 'Active Monitoring', 'Approved', 74.0, 66.0, 58.0, 'In Progress', 'Medium', 49, 'MEDIUM', 12.868000, 74.965000),
        ('DK-LA-026', 'Melkar Agricultural Produce Market Layout', 'APMC Market Yard', 'Bantwal', 'Melkar', 18.00, 22, '2025-02-01', '2026-10-01', 'Active Monitoring', 'Approved', 68.0, 60.0, 52.0, 'In Progress', 'Medium', 54, 'MEDIUM', 12.860000, 75.012000),
        ('DK-LA-027', 'Modankap Educational Complex Expansion', 'Institutional Infrastructure', 'Bantwal', 'Modankap', 6.50, 5, '2025-05-15', '2026-05-15', 'Completed', 'Approved', 90.0, 86.0, 80.0, 'Completed', 'High', 20, 'LOW', 12.885000, 75.041000),
        ('DK-LA-028', 'Benjanapadavu Skill Development Layout', 'Training Complex', 'Bantwal', 'Benjanapadavu', 8.40, 7, '2025-04-10', '2026-06-10', 'Completed', 'Approved', 92.0, 88.0, 82.0, 'Completed', 'High', 18, 'LOW', 12.902000, 74.989000),

        ('DK-LA-005', 'Belthangady Rural Infrastructure Improvement', 'Rural Road & Bridge Expansion', 'Belthangady', 'Ujire', 12.40, 14, '2025-04-18', '2026-10-18', 'On Schedule', 'Approved', 90.0, 88.0, 80.0, 'In Progress', 'High', 22, 'LOW', 13.015000, 75.328000),
        ('DK-LA-029', 'Dharmasthala Pilgrim Corridor & Parking', 'Pilgrim Corridor', 'Belthangady', 'Dharmasthala', 21.00, 38, '2025-02-05', '2027-02-05', 'Active Monitoring', 'Approved', 58.0, 46.0, 35.0, 'Pending', 'Low', 75, 'HIGH', 12.951000, 75.378000),
        ('DK-LA-030', 'Guruvayanakere Bypass Corridor', 'Bypass Road', 'Belthangady', 'Guruvayanakere', 14.50, 22, '2025-03-01', '2026-09-01', 'Active Monitoring', 'Approved', 72.0, 68.0, 56.0, 'In Progress', 'Medium', 48, 'MEDIUM', 13.002000, 75.295000),
        ('DK-LA-031', 'Madanthyar Rural Agro Hub', 'Agro Processing Zone', 'Belthangady', 'Madanthyar', 16.00, 19, '2025-05-10', '2027-01-10', 'Active Monitoring', 'Approved', 70.0, 65.0, 55.0, 'In Progress', 'Medium', 51, 'MEDIUM', 12.981000, 75.195000),
        ('DK-LA-032', 'Laila Civic Amenities Zone', 'Civic Layout', 'Belthangady', 'Laila', 7.20, 6, '2025-06-01', '2026-06-01', 'Completed', 'Approved', 94.0, 90.0, 84.0, 'Completed', 'High', 16, 'LOW', 13.028000, 75.312000),
        ('DK-LA-033', 'Kokkada Sub-Hospital Expansion', 'Healthcare Infrastructure', 'Belthangady', 'Kokkada', 5.50, 4, '2025-07-15', '2026-07-15', 'Completed', 'Approved', 95.0, 92.0, 88.0, 'Completed', 'High', 14, 'LOW', 12.885000, 75.385000),

        ('DK-LA-003', 'Puttur Water Infrastructure & Pipeline Corridor', 'Water & Sanitation Infrastructure', 'Puttur', 'Kabila', 16.20, 28, '2025-01-11', '2026-07-11', 'Active Monitoring', 'Approved', 55.0, 35.0, 25.0, 'Pending', 'Low', 78, 'HIGH', 12.766000, 75.201000),
        ('DK-LA-010', 'Puttur Railway Overbridge & Feeder Road', 'Rail Infrastructure', 'Puttur', 'Darbe', 9.80, 24, '2025-06-15', '2026-12-15', 'Active Monitoring', 'Approved', 78.0, 70.0, 60.0, 'In Progress', 'Medium', 48, 'MEDIUM', 12.752000, 75.215000),
        ('DK-LA-034', 'Narimogaru Agricultural Processing Zone', 'Agro Park', 'Puttur', 'Narimogaru', 26.00, 42, '2025-02-15', '2027-08-15', 'Active Monitoring', 'Approved', 50.0, 40.0, 28.0, 'Pending', 'Low', 80, 'HIGH', 12.721000, 75.242000),
        ('DK-LA-035', 'Parladka Commercial Bypass Link', 'Commercial Bypass', 'Puttur', 'Parladka', 11.50, 18, '2025-04-01', '2026-10-01', 'Active Monitoring', 'Approved', 70.0, 64.0, 52.0, 'In Progress', 'Medium', 53, 'MEDIUM', 12.761000, 75.208000),
        ('DK-LA-036', 'Uppinangady River Confluence Bridge', 'River Bridge & Feeder', 'Puttur', 'Uppinangady', 14.80, 25, '2025-03-20', '2026-11-20', 'Active Monitoring', 'Approved', 68.0, 62.0, 50.0, 'In Progress', 'Medium', 57, 'MEDIUM', 12.839000, 75.251000),
        ('DK-LA-037', 'Bellare Sub-Divisional Storage Yard', 'Storage Depot', 'Puttur', 'Bellare', 8.00, 6, '2025-05-10', '2026-05-10', 'Completed', 'Approved', 90.0, 88.0, 82.0, 'Completed', 'High', 18, 'LOW', 12.651000, 75.321000),
        ('DK-LA-038', 'Kabaka Industrial Sub-Yard', 'Industrial Layout', 'Puttur', 'Kabaka', 10.20, 8, '2025-06-01', '2026-08-01', 'Completed', 'Approved', 88.0, 85.0, 78.0, 'Completed', 'High', 22, 'LOW', 12.782000, 75.185000),

        ('DK-LA-006', 'Sullia Forest Fringe Corridor Expansion', 'Eco-Road Corridor', 'Sullia', 'Jaini', 34.00, 22, '2025-03-12', '2027-09-12', 'Active Monitoring', 'Approved', 60.0, 52.0, 40.0, 'Pending', 'Medium', 64, 'MEDIUM', 12.562000, 75.390000),
        ('DK-LA-039', 'Aranthodu Ghat Road Safety Bypass', 'Ghat Road Bypass', 'Sullia', 'Aranthodu', 18.50, 35, '2025-01-20', '2027-01-20', 'Active Monitoring', 'Approved', 52.0, 42.0, 30.0, 'Pending', 'Low', 77, 'HIGH', 12.521000, 75.435000),
        ('DK-LA-040', 'Sampaje Border Checkpoint Expansion', 'Inter-State Checkpoint', 'Sullia', 'Sampaje', 12.00, 14, '2025-04-15', '2026-10-15', 'Active Monitoring', 'Approved', 72.0, 66.0, 55.0, 'In Progress', 'Medium', 52, 'MEDIUM', 12.502000, 75.512000),
        ('DK-LA-041', 'Jalthoor Rural Hydro Electric Substation', 'Power Substation', 'Sullia', 'Jalthoor', 9.00, 6, '2025-05-01', '2026-05-01', 'Completed', 'Approved', 92.0, 88.0, 82.0, 'Completed', 'High', 19, 'LOW', 12.585000, 75.361000),

        ('DK-LA-007', 'Kadaba Sub-Divisional Complex Land', 'Administrative Complex', 'Kadaba', 'Nelyadi', 8.50, 6, '2025-08-01', '2026-08-01', 'On Schedule', 'Approved', 88.0, 82.0, 75.0, 'In Progress', 'High', 28, 'LOW', 12.783000, 75.312000),
        ('DK-LA-042', 'Ramakunja Railway Feeder Corridor', 'Rail Feeder Road', 'Kadaba', 'Ramakunja', 17.50, 32, '2025-02-10', '2027-02-10', 'Active Monitoring', 'Approved', 54.0, 43.0, 28.0, 'Pending', 'Low', 76, 'HIGH', 12.745000, 75.285000),
        ('DK-LA-043', 'Alankaru Dairy Processing Complex', 'Agro Processing Zone', 'Kadaba', 'Alankaru', 14.00, 18, '2025-04-20', '2026-10-20', 'Active Monitoring', 'Approved', 70.0, 65.0, 55.0, 'In Progress', 'Medium', 51, 'MEDIUM', 12.798000, 75.261000),
        ('DK-LA-044', 'Ichlampady River Bridge Layout', 'River Bridge', 'Kadaba', 'Ichlampady', 6.80, 5, '2025-06-01', '2026-06-01', 'Completed', 'Approved', 94.0, 90.0, 85.0, 'Completed', 'High', 15, 'LOW', 12.812000, 75.345000),

        ('DK-LA-004', 'Moodbidri Industrial Access Corridor', 'Industrial Park Infrastructure', 'Moodbidri', 'Mijar', 55.00, 18, '2025-06-01', '2026-06-01', 'On Schedule', 'Approved', 95.0, 92.0, 88.0, 'Completed', 'High', 14, 'LOW', 13.068000, 74.995000),
        ('DK-LA-045', 'Alangar Heritage Tourist Ring Road', 'Heritage Tourism Ring Road', 'Moodbidri', 'Alangar', 19.50, 42, '2025-01-10', '2027-01-10', 'Active Monitoring', 'Approved', 48.0, 39.0, 26.0, 'Pending', 'Low', 79, 'HIGH', 13.078000, 74.982000),
        ('DK-LA-046', 'Gantikette Bio-Tech Industrial Park', 'Industrial Estate', 'Moodbidri', 'Gantikette', 24.00, 26, '2025-03-15', '2026-11-15', 'Active Monitoring', 'Approved', 68.0, 62.0, 52.0, 'In Progress', 'Medium', 55, 'MEDIUM', 13.051000, 75.021000),
        ('DK-LA-047', 'Tenkabail Water Reservoir Corridor', 'Water Infrastructure', 'Moodbidri', 'Tenkabail', 15.00, 20, '2025-05-01', '2026-11-01', 'Active Monitoring', 'Approved', 72.0, 66.0, 56.0, 'In Progress', 'Medium', 48, 'MEDIUM', 13.092000, 74.961000),
        ('DK-LA-048', 'Mastikatte Civic Infrastructure Layout', 'Civic Infrastructure', 'Moodbidri', 'Mastikatte', 11.00, 14, '2025-04-10', '2026-10-10', 'Active Monitoring', 'Approved', 70.0, 64.0, 54.0, 'In Progress', 'Medium', 50, 'MEDIUM', 13.061000, 75.011000)
    ]

    cursor.executemany("""
    INSERT INTO projects (project_code, project_name, project_type, taluk, village, land_area, affected_families, start_date, target_date, status, approval_status, documentation_percentage, compensation_percentage, rehabilitation_percentage, possession_status, stakeholder_responsiveness, delay_probability, risk_level, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, projects_data)

    # Populate Compensation, Rehabilitation, Disputes, and Alerts
    cursor.execute("""
    INSERT INTO compensation (project_id, total_amount, paid_amount, pending_amount, percentage_completed, status)
    SELECT id, (land_area * 500000), (land_area * 500000 * compensation_percentage / 100), (land_area * 500000 * (100 - compensation_percentage) / 100), compensation_percentage, 'In Progress'
    FROM projects
    """)

    cursor.execute("""
    INSERT INTO rehabilitation (project_id, affected_families, rehabilitated_families, percentage_completed, status)
    SELECT id, affected_families, CAST(affected_families * rehabilitation_percentage / 100 AS INT), rehabilitation_percentage, 'In Progress'
    FROM projects
    """)

    cursor.execute("""
    INSERT INTO legal_disputes (project_id, dispute_type, description, status, severity) VALUES
    (1, 'Land Valuation Suit', 'Objection to award rate per acre in Sub-Court Panambur', 'Pending', 'HIGH'),
    (1, 'Tenancy Title Claim', 'Dispute regarding tenancy rights under Land Reforms Act', 'Pending', 'HIGH'),
    (2, 'Compensation Enhancement', 'Petition filed in High Court seeking 3x market value', 'Pending', 'HIGH'),
    (2, 'Boundary Encroachment', 'Objection regarding ancestral boundary markers in Baikampady', 'Pending', 'HIGH'),
    (3, 'Gram Sabha Objection', 'Resolution against agricultural land conversion', 'Pending', 'HIGH'),
    (4, 'Commercial Shop Displacement', 'Trader association injunction on shop eviction', 'Pending', 'HIGH'),
    (15, 'Inheritance Partition Dispute', 'Family dispute over inheritance title split in Kalladka', 'Pending', 'HIGH'),
    (16, 'Valuation Dispute', 'Sub-court valuation petition by 14 landholders in Vittal', 'Pending', 'HIGH')
    """)

    cursor.execute("""
    INSERT INTO alerts (project_id, alert_type, severity, title, message, status) VALUES
    (2, 'RISK_BREACH', 'CRITICAL', 'Logistics Hub Risk Exceeded 85%', 'Predicted delay probability breached 85% threshold due to 11 active litigation stays.', 'ACTIVE'),
    (1, 'MILESTONE_DELAY', 'HIGH', 'Coastal Expansion Compensation Lag', 'Compensation progress stuck at 48% for 45 consecutive days. Milestone overdue.', 'ACTIVE'),
    (29, 'LEGAL_DISPUTE', 'HIGH', 'Water Corridor Valuation Suit', 'New land valuation objection filed in Sub-Court by 14 landholders.', 'ACTIVE')
    """)

    conn.commit()
    conn.close()
    print(f"[Database Seeded] Initialized SQLite database at {DB_PATH} with 48 Projects!")

if __name__ == '__main__':
    seed_database()
