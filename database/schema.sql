-- ============================================================================
-- LANDGUARD AI DATABASE SCHEMA & SEED DATA
-- Predictive Land Acquisition Risk Analytics for Dakshina Kannada District
-- Database: landguard
-- ============================================================================

CREATE DATABASE IF NOT EXISTS landguard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE landguard;

-- Disable Foreign Key checks for clean recreation
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS predictions;
DROP TABLE IF EXISTS rehabilitation;
DROP TABLE IF EXISTS legal_disputes;
DROP TABLE IF EXISTS compensation;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Land Officer',
    department VARCHAR(100) DEFAULT 'Dakshina Kannada Revenue Department',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 2. PROJECTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_code VARCHAR(30) NOT NULL UNIQUE,
    project_name VARCHAR(255) NOT NULL,
    project_type VARCHAR(100) NOT NULL,
    taluk VARCHAR(50) NOT NULL,
    village VARCHAR(100) NOT NULL,
    land_area DECIMAL(10, 2) NOT NULL,
    affected_families INT NOT NULL DEFAULT 0,
    start_date DATE NULL,
    target_date DATE NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Active Monitoring',
    approval_status VARCHAR(50) NOT NULL DEFAULT 'Approved',
    documentation_percentage DECIMAL(5, 2) NOT NULL DEFAULT 50.0,
    compensation_percentage DECIMAL(5, 2) NOT NULL DEFAULT 50.0,
    rehabilitation_percentage DECIMAL(5, 2) NOT NULL DEFAULT 50.0,
    possession_status VARCHAR(50) NOT NULL DEFAULT 'In Progress',
    stakeholder_responsiveness VARCHAR(20) NOT NULL DEFAULT 'Medium',
    delay_probability INT NOT NULL DEFAULT 50,
    risk_level VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    latitude DECIMAL(10, 6) NULL,
    longitude DECIMAL(10, 6) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_taluk (taluk),
    INDEX idx_risk_level (risk_level),
    INDEX idx_project_code (project_code)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 3. COMPENSATION TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE compensation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    pending_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    percentage_completed DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'In Progress',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 4. LEGAL DISPUTES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE legal_disputes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    dispute_type VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 5. REHABILITATION TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE rehabilitation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    affected_families INT NOT NULL DEFAULT 0,
    rehabilitated_families INT NOT NULL DEFAULT 0,
    percentage_completed DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'In Progress',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 6. PREDICTIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NULL,
    delay_probability INT NOT NULL,
    risk_category VARCHAR(20) NOT NULL,
    confidence INT NOT NULL DEFAULT 88,
    prediction_method VARCHAR(100) DEFAULT 'Random Forest Classifier (v2.4 Prototype)',
    risk_factors JSON NULL,
    recommendations JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 7. ALERTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'HIGH',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- ============================================================================
-- SAMPLE PROTOTYPE DATA INSERTION (DAKSHINA KANNADA DISTRICT)
-- ============================================================================

-- Insert Demo Users
INSERT INTO users (name, email, password_hash, role, department) VALUES
('District Administrator', 'admin@landguard.ai', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'Administrator', 'Dakshina Kannada District Collectorate'),
('Land Acquisition Officer', 'officer@landguard.ai', 'e1c9d646b9a84a62e086f0309e4f01efc6096bf8624467d3e74be8f75ffc9502', 'Land Officer', 'Special Land Acquisition Cell');

-- Insert 48 Dakshina Kannada Monitored Projects
INSERT INTO projects (project_code, project_name, project_type, taluk, village, land_area, affected_families, start_date, target_date, status, approval_status, documentation_percentage, compensation_percentage, rehabilitation_percentage, possession_status, stakeholder_responsiveness, delay_probability, risk_level, latitude, longitude) VALUES
-- Mangaluru (14 Projects: 4 High, 6 Med, 4 Low)
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

-- Bantwal (8 Projects: 2 High, 4 Med, 2 Low)
('DK-LA-002', 'Bantwal Regional Connectivity Project', 'Highway & Bypass Expansion', 'Bantwal', 'B.C. Road', 28.00, 42, '2025-05-20', '2027-05-20', 'Active Monitoring', 'Approved', 84.0, 76.0, 65.0, 'In Progress', 'Medium', 45, 'MEDIUM', 12.879000, 75.032000),
('DK-LA-009', 'Bantwal Industrial Estate Phase 2', 'Industrial Estate', 'Bantwal', 'Mani', 38.00, 35, '2025-04-02', '2027-04-02', 'Active Monitoring', 'Approved', 70.0, 62.0, 50.0, 'In Progress', 'Medium', 56, 'MEDIUM', 12.839000, 75.105000),
('DK-LA-023', 'Kalladka Flyover Feeder Corridor', 'Flyover Feeder', 'Bantwal', 'Kalladka', 15.40, 48, '2025-01-15', '2027-07-15', 'Active Monitoring', 'Approved', 48.0, 38.0, 25.0, 'Pending', 'Low', 81, 'HIGH', 12.861000, 75.068000),
('DK-LA-024', 'Vittal Water Treatment Plant Corridor', 'Water Infrastructure', 'Bantwal', 'Vittal', 12.00, 32, '2025-03-20', '2027-03-20', 'Active Monitoring', 'Approved', 52.0, 44.0, 30.0, 'Pending', 'Low', 73, 'HIGH', 12.768000, 75.102000),
('DK-LA-025', 'Farangipete Riverbank Protection Works', 'River Protection', 'Bantwal', 'Farangipete', 9.60, 20, '2025-06-10', '2026-12-10', 'Active Monitoring', 'Approved', 74.0, 66.0, 58.0, 'In Progress', 'Medium', 49, 'MEDIUM', 12.868000, 74.965000),
('DK-LA-026', 'Melkar Agricultural Produce Market Layout', 'APMC Market Yard', 'Bantwal', 'Melkar', 18.00, 22, '2025-02-01', '2026-10-01', 'Active Monitoring', 'Approved', 68.0, 60.0, 52.0, 'In Progress', 'Medium', 54, 'MEDIUM', 12.860000, 75.012000),
('DK-LA-027', 'Modankap Educational Complex Expansion', 'Institutional Infrastructure', 'Bantwal', 'Modankap', 6.50, 5, '2025-05-15', '2026-05-15', 'Completed', 'Approved', 90.0, 86.0, 80.0, 'Completed', 'High', 20, 'LOW', 12.885000, 75.041000),
('DK-LA-028', 'Benjanapadavu Skill Development Layout', 'Training Complex', 'Bantwal', 'Benjanapadavu', 8.40, 7, '2025-04-10', '2026-06-10', 'Completed', 'Approved', 92.0, 88.0, 82.0, 'Completed', 'High', 18, 'LOW', 12.902000, 74.989000),

-- Belthangady (6 Projects: 1 High, 2 Med, 3 Low)
('DK-LA-005', 'Belthangady Rural Infrastructure Improvement', 'Rural Road & Bridge Expansion', 'Belthangady', 'Ujire', 12.40, 14, '2025-04-18', '2026-10-18', 'On Schedule', 'Approved', 90.0, 88.0, 80.0, 'In Progress', 'High', 22, 'LOW', 13.015000, 75.328000),
('DK-LA-029', 'Dharmasthala Pilgrim Corridor & Parking', 'Pilgrim Corridor', 'Belthangady', 'Dharmasthala', 21.00, 38, '2025-02-05', '2027-02-05', 'Active Monitoring', 'Approved', 58.0, 46.0, 35.0, 'Pending', 'Low', 75, 'HIGH', 12.951000, 75.378000),
('DK-LA-030', 'Guruvayanakere Bypass Corridor', 'Bypass Road', 'Belthangady', 'Guruvayanakere', 14.50, 22, '2025-03-01', '2026-09-01', 'Active Monitoring', 'Approved', 72.0, 68.0, 56.0, 'In Progress', 'Medium', 48, 'MEDIUM', 13.002000, 75.295000),
('DK-LA-031', 'Madanthyar Rural Agro Hub', 'Agro Processing Zone', 'Belthangady', 'Madanthyar', 16.00, 19, '2025-05-10', '2027-01-10', 'Active Monitoring', 'Approved', 70.0, 65.0, 55.0, 'In Progress', 'Medium', 51, 'MEDIUM', 12.981000, 75.195000),
('DK-LA-032', 'Laila Civic Amenities Zone', 'Civic Layout', 'Belthangady', 'Laila', 7.20, 6, '2025-06-01', '2026-06-01', 'Completed', 'Approved', 94.0, 90.0, 84.0, 'Completed', 'High', 16, 'LOW', 13.028000, 75.312000),
('DK-LA-033', 'Kokkada Sub-Hospital Expansion', 'Healthcare Infrastructure', 'Belthangady', 'Kokkada', 5.50, 4, '2025-07-15', '2026-07-15', 'Completed', 'Approved', 95.0, 92.0, 88.0, 'Completed', 'High', 14, 'LOW', 12.885000, 75.385000),

-- Puttur (7 Projects: 2 High, 3 Med, 2 Low)
('DK-LA-003', 'Puttur Water Infrastructure & Pipeline Corridor', 'Water & Sanitation Infrastructure', 'Puttur', 'Kabila', 16.20, 28, '2025-01-11', '2026-07-11', 'Active Monitoring', 'Approved', 55.0, 35.0, 25.0, 'Pending', 'Low', 78, 'HIGH', 12.766000, 75.201000),
('DK-LA-010', 'Puttur Railway Overbridge & Feeder Road', 'Rail Infrastructure', 'Puttur', 'Darbe', 9.80, 24, '2025-06-15', '2026-12-15', 'Active Monitoring', 'Approved', 78.0, 70.0, 60.0, 'In Progress', 'Medium', 48, 'MEDIUM', 12.752000, 75.215000),
('DK-LA-034', 'Narimogaru Agricultural Processing Zone', 'Agro Park', 'Puttur', 'Narimogaru', 26.00, 42, '2025-02-15', '2027-08-15', 'Active Monitoring', 'Approved', 50.0, 40.0, 28.0, 'Pending', 'Low', 80, 'HIGH', 12.721000, 75.242000),
('DK-LA-035', 'Parladka Commercial Bypass Link', 'Commercial Bypass', 'Puttur', 'Parladka', 11.50, 18, '2025-04-01', '2026-10-01', 'Active Monitoring', 'Approved', 70.0, 64.0, 52.0, 'In Progress', 'Medium', 53, 'MEDIUM', 12.761000, 75.208000),
('DK-LA-036', 'Uppinangady River Confluence Bridge', 'River Bridge & Feeder', 'Puttur', 'Uppinangady', 14.80, 25, '2025-03-20', '2026-11-20', 'Active Monitoring', 'Approved', 68.0, 62.0, 50.0, 'In Progress', 'Medium', 57, 'MEDIUM', 12.839000, 75.251000),
('DK-LA-037', 'Bellare Sub-Divisional Storage Yard', 'Storage Depot', 'Puttur', 'Bellare', 8.00, 6, '2025-05-10', '2026-05-10', 'Completed', 'Approved', 90.0, 88.0, 82.0, 'Completed', 'High', 18, 'LOW', 12.651000, 75.321000),
('DK-LA-038', 'Kabaka Industrial Sub-Yard', 'Industrial Layout', 'Puttur', 'Kabaka', 10.20, 8, '2025-06-01', '2026-08-01', 'Completed', 'Approved', 88.0, 85.0, 78.0, 'Completed', 'High', 22, 'LOW', 12.782000, 75.185000),

-- Sullia (4 Projects: 1 High, 2 Med, 1 Low)
('DK-LA-006', 'Sullia Forest Fringe Corridor Expansion', 'Eco-Road Corridor', 'Sullia', 'Jaini', 34.00, 22, '2025-03-12', '2027-09-12', 'Active Monitoring', 'Approved', 60.0, 52.0, 40.0, 'Pending', 'Medium', 64, 'MEDIUM', 12.562000, 75.390000),
('DK-LA-039', 'Aranthodu Ghat Road Safety Bypass', 'Ghat Road Bypass', 'Sullia', 'Aranthodu', 18.50, 35, '2025-01-20', '2027-01-20', 'Active Monitoring', 'Approved', 52.0, 42.0, 30.0, 'Pending', 'Low', 77, 'HIGH', 12.521000, 75.435000),
('DK-LA-040', 'Sampaje Border Checkpoint Expansion', 'Inter-State Checkpoint', 'Sullia', 'Sampaje', 12.00, 14, '2025-04-15', '2026-10-15', 'Active Monitoring', 'Approved', 72.0, 66.0, 55.0, 'In Progress', 'Medium', 52, 'MEDIUM', 12.502000, 75.512000),
('DK-LA-041', 'Jalthoor Rural Hydro Electric Substation', 'Power Substation', 'Sullia', 'Jalthoor', 9.00, 6, '2025-05-01', '2026-05-01', 'Completed', 'Approved', 92.0, 88.0, 82.0, 'Completed', 'High', 19, 'LOW', 12.585000, 75.361000),

-- Kadaba (4 Projects: 1 High, 1 Med, 2 Low)
('DK-LA-007', 'Kadaba Sub-Divisional Complex Land', 'Administrative Complex', 'Kadaba', 'Nelyadi', 8.50, 6, '2025-08-01', '2026-08-01', 'On Schedule', 'Approved', 88.0, 82.0, 75.0, 'In Progress', 'High', 28, 'LOW', 12.783000, 75.312000),
('DK-LA-042', 'Ramakunja Railway Feeder Corridor', 'Rail Feeder Road', 'Kadaba', 'Ramakunja', 17.50, 32, '2025-02-10', '2027-02-10', 'Active Monitoring', 'Approved', 54.0, 43.0, 28.0, 'Pending', 'Low', 76, 'HIGH', 12.745000, 75.285000),
('DK-LA-043', 'Alankaru Dairy Processing Complex', 'Agro Processing Zone', 'Kadaba', 'Alankaru', 14.00, 18, '2025-04-20', '2026-10-20', 'Active Monitoring', 'Approved', 70.0, 65.0, 55.0, 'In Progress', 'Medium', 51, 'MEDIUM', 12.798000, 75.261000),
('DK-LA-044', 'Ichlampady River Bridge Layout', 'River Bridge', 'Kadaba', 'Ichlampady', 6.80, 5, '2025-06-01', '2026-06-01', 'Completed', 'Approved', 94.0, 90.0, 85.0, 'Completed', 'High', 15, 'LOW', 12.812000, 75.345000),

-- Moodbidri (5 Projects: 1 High, 3 Med, 1 Low)
('DK-LA-004', 'Moodbidri Industrial Access Corridor', 'Industrial Park Infrastructure', 'Moodbidri', 'Mijar', 55.00, 18, '2025-06-01', '2026-06-01', 'On Schedule', 'Approved', 95.0, 92.0, 88.0, 'Completed', 'High', 14, 'LOW', 13.068000, 74.995000),
('DK-LA-045', 'Alangar Heritage Tourist Ring Road', 'Heritage Tourism Ring Road', 'Moodbidri', 'Alangar', 19.50, 42, '2025-01-10', '2027-01-10', 'Active Monitoring', 'Approved', 48.0, 39.0, 26.0, 'Pending', 'Low', 79, 'HIGH', 13.078000, 74.982000),
('DK-LA-046', 'Gantikette Bio-Tech Industrial Park', 'Industrial Estate', 'Moodbidri', 'Gantikette', 24.00, 26, '2025-03-15', '2026-11-15', 'Active Monitoring', 'Approved', 68.0, 62.0, 52.0, 'In Progress', 'Medium', 55, 'MEDIUM', 13.051000, 75.021000),
('DK-LA-047', 'Tenkabail Water Reservoir Corridor', 'Water Infrastructure', 'Moodbidri', 'Tenkabail', 15.00, 20, '2025-05-01', '2026-11-01', 'Active Monitoring', 'Approved', 72.0, 66.0, 56.0, 'In Progress', 'Medium', 48, 'MEDIUM', 13.092000, 74.961000),
('DK-LA-048', 'Mastikatte Civic Infrastructure Layout', 'Civic Infrastructure', 'Moodbidri', 'Mastikatte', 11.00, 14, '2025-04-10', '2026-10-10', 'Active Monitoring', 'Approved', 70.0, 64.0, 54.0, 'In Progress', 'Medium', 50, 'MEDIUM', 13.061000, 75.011000);


-- Populate Compensation records
INSERT INTO compensation (project_id, total_amount, paid_amount, pending_amount, percentage_completed, status)
SELECT id, (land_area * 500000), (land_area * 500000 * compensation_percentage / 100), (land_area * 500000 * (100 - compensation_percentage) / 100), compensation_percentage, IF(compensation_percentage >= 90, 'Completed', 'In Progress')
FROM projects;

-- Populate Rehabilitation records
INSERT INTO rehabilitation (project_id, affected_families, rehabilitated_families, percentage_completed, status)
SELECT id, affected_families, FLOOR(affected_families * rehabilitation_percentage / 100), rehabilitation_percentage, IF(rehabilitation_percentage >= 90, 'Completed', 'In Progress')
FROM projects;

-- Populate Legal Disputes records
INSERT INTO legal_disputes (project_id, dispute_type, description, status, severity) VALUES
(1, 'Land Valuation Suit', 'Objection to award rate per acre in Sub-Court Panambur', 'Pending', 'HIGH'),
(1, 'Tenancy Title Claim', 'Dispute regarding tenancy rights under Land Reforms Act', 'Pending', 'HIGH'),
(2, 'Compensation Enhancement', 'Petition filed in High Court seeking 3x market value', 'Pending', 'HIGH'),
(2, 'Boundary Encroachment', 'Objection regarding ancestral boundary markers in Baikampady', 'Pending', 'HIGH'),
(3, 'Gram Sabha Objection', 'Resolution against agricultural land conversion', 'Pending', 'HIGH'),
(4, 'Commercial Shop Displacement', 'Trader association injunction on shop eviction', 'Pending', 'HIGH'),
(15, 'Inheritance Partition Dispute', 'Family dispute over inheritance title split in Kalladka', 'Pending', 'HIGH'),
(16, 'Valuation Dispute', 'Sub-court valuation petition by 14 landholders in Vittal', 'Pending', 'HIGH'),
(21, 'Temple Land Objection', 'Objection to acquiring Devasthanam access corridor', 'Pending', 'HIGH'),
(23, 'Agricultural Land Compensation', 'Sub-Court objection to award rate per acre in Kabila', 'Pending', 'HIGH'),
(25, 'Coffee Estate Valuation', 'High Court petition for commercial crop loss enhancement', 'Pending', 'HIGH'),
(30, 'Forest Clearance Backlog', 'Tree clearance certificate pending with MoEFCC Regional office', 'Pending', 'MEDIUM'),
(33, 'Ghat Land Acquisition Objection', 'Local tribal rights committee petition under FRA 2006', 'Pending', 'HIGH'),
(36, 'Rail Line Feeder Dispute', 'Objection to access road gradient cutting through private land', 'Pending', 'HIGH'),
(39, 'Heritage Site Buffer Zone', 'Objection by Local Jain Heritage Board regarding buffer zone', 'Pending', 'HIGH');

-- Populate Alerts records
INSERT INTO alerts (project_id, alert_type, severity, title, message, status) VALUES
(2, 'RISK_BREACH', 'CRITICAL', 'Logistics Hub Risk Exceeded 85%', 'Predicted delay probability breached 85% threshold due to 11 active litigation stays.', 'ACTIVE'),
(1, 'MILESTONE_DELAY', 'HIGH', 'Coastal Expansion Compensation Lag', 'Compensation progress stuck at 48% for 45 consecutive days. Milestone overdue.', 'ACTIVE'),
(23, 'LEGAL_DISPUTE', 'HIGH', 'Water Corridor Valuation Suit', 'New land valuation objection filed in Sub-Court by 14 landholders.', 'ACTIVE'),
(15, 'COMPENSATION_ALERT', 'HIGH', 'Kalladka Feeder Backlog', 'Compensation disbursal below 40% threshold with 6 active land suits.', 'ACTIVE'),
(30, 'DOCUMENTATION_DELAY', 'MEDIUM', 'Forest Certificate Pending', 'Forest clearance certificate documentation pending approval for over 60 days.', 'ACTIVE');

-- Populate Predictions records
INSERT INTO predictions (project_id, delay_probability, risk_category, confidence, risk_factors, recommendations)
SELECT id, delay_probability, risk_level, 88,
JSON_ARRAY(
  JSON_OBJECT('factor', 'Compensation Disbursal', 'displayVal', CONCAT('+', ROUND((100 - compensation_percentage) / 200, 2)), 'pctWidth', 80, 'color', '#DC2626'),
  JSON_OBJECT('factor', 'Legal Disputes', 'displayVal', '+0.22', 'pctWidth', 65, 'color', '#DC2626'),
  JSON_OBJECT('factor', 'Rehabilitation Layout', 'displayVal', CONCAT('+', ROUND((100 - rehabilitation_percentage) / 250, 2)), 'pctWidth', 50, 'color', '#F59E0B')
),
JSON_ARRAY(
  JSON_OBJECT('priority', 'URGENT', 'title', 'Accelerate pending compensation disbursement', 'desc', 'Convene dedicated revenue collector desk to disburse pending awards.'),
  JSON_OBJECT('priority', 'HIGH', 'title', 'Prioritize resolution of active legal disputes', 'desc', 'Initiate out-of-court settlement committee for valuation suits.')
)
FROM projects;
