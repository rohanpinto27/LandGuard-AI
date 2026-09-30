# LANDGUARD AI
### Predictive Land Acquisition Risk Analytics — Dakshina Kannada District, Karnataka
> **Problem Statement (SIH26017):** AI-powered decision support platform for identifying infrastructure and land development projects at risk of delay, tracking compensation progress, legal disputes, and generating proactive administrative interventions.

---

## 🏛️ Project Overview

LandGuard AI is a complete full-stack decision-support system built for district administration and land acquisition officers in Dakshina Kannada. The system combines an executive GIS intelligence dashboard with a Flask REST API and MySQL database to calculate project delay probabilities and explain risk factors.

---

## 🏗️ Full-Stack Technology Architecture

### 1. FRONTEND (20 Marks)
- **HTML5 & CSS3:** Responsive light theme design system (`#0B1F3A` Deep Navy, `#1769E0` Blue, `#0EA5A8` Teal).
- **Vanilla JavaScript (ES6+):** Dynamic navigation, state handling, toast notifications, search, and filtering.
- **Chart.js:** Executive line trends, risk distribution doughnut charts, and taluk comparison bar graphs.
- **Leaflet.js & OpenStreetMap:** Interactive GIS map centered on Dakshina Kannada (`[12.8702, 74.8806]`).

### 2. BACKEND (20 Marks)
- **Python 3 & Flask:** Lightweight modular REST API (`backend/app.py`).
- **Flask-CORS:** Enabled for cross-origin browser requests from frontend.
- **MySQL Connector:** Native MySQL database pooling and query abstraction (`backend/models/database.py`).
- **Risk Prediction Engine:** Multi-factor deterministic risk calculator (`backend/services/risk_service.py`).

### 3. DATABASE (20 Marks)
- **MySQL (`landguard` schema):** Relational database containing 7 normalized tables.
- **48 Seed Projects:** Complete monitored dataset across Dakshina Kannada's 7 taluks (*Mangaluru, Bantwal, Belthangady, Puttur, Sullia, Kadaba, Moodbidri*).

---

## 📁 Project Directory Structure

```
LandGuard-AI/
├── frontend/                   # Client-side web application
│   ├── index.html              # Entry redirect router
│   ├── login.html              # Demo authentication interface
│   ├── dashboard.html          # Executive command center
│   ├── projects.html           # Filterable multi-view repository
│   ├── project-details.html    # Detailed project profile & XAI
│   ├── risk-map.html           # Full-screen Leaflet GIS map
│   ├── ai-analysis.html        # Interactive AI Risk Calculator
│   ├── alerts.html             # Early-warning monitoring hub
│   ├── reports.html            # District analytics & CSV exporter
│   ├── settings.html           # System thresholds & diagnostic panel
│   ├── css/                    # Style sheets (style.css, components.css, responsive.css)
│   ├── js/                     # JS controllers (app.js, api.js, auth.js, dashboard.js, etc.)
│   └── assets/                 # Icons & image assets
│
├── backend/                    # Python Flask REST API
│   ├── app.py                  # Main Flask entry point (Port 5000)
│   ├── config.py               # Database & environment configuration
│   ├── requirements.txt        # Dependencies list
│   ├── .env.example            # Environment variables template
│   ├── routes/                 # API route blueprints
│   │   ├── auth.py             # Authentication endpoints
│   │   ├── dashboard.py        # Dashboard analytics endpoint
│   │   ├── projects.py         # Projects CRUD endpoints
│   │   ├── predictions.py      # AI risk prediction endpoint
│   │   ├── alerts.py           # Alerts feed endpoint
│   │   └── reports.py          # Reports & Taluks endpoints
│   ├── models/                 # Database helper & connection pool
│   │   └── database.py
│   └── services/               # Prediction calculation engine
│       └── risk_service.py
│
├── database/                   # MySQL Schema & Seed Data
│   └── schema.sql              # Complete database DDL & DML script
│
├── README.md                   # System documentation & setup guide
└── .gitignore                  # Git exclusions
```

---

## 🗄️ Database Tables (`landguard` Schema)

1. `users` — Administrator & Land Officer user accounts.
2. `projects` — 48 land acquisition projects across Dakshina Kannada.
3. `compensation` — Total, paid, and pending financial compensation amounts.
4. `legal_disputes` — Court litigation cases, valuation objections, and severity.
5. `rehabilitation` — Affected families and resettlement colony progress.
6. `predictions` — AI delay probability logs, confidence, and recommendations.
7. `alerts` — Proactive risk threshold warning feed.

---

## 📡 Flask REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | API & Database health diagnostic check |
| `POST` | `/api/auth/login` | Authenticate user against MySQL `users` table |
| `GET` | `/api/dashboard` | Calculate district summary statistics & risk counts |
| `GET` | `/api/projects` | Fetch monitored projects with filters (`search`, `taluk`, `risk`) |
| `GET` | `/api/projects/<id>` | Fetch single project details & timeline |
| `POST` | `/api/projects` | Insert new project record into MySQL |
| `PUT` | `/api/projects/<id>` | Update existing project details |
| `POST` | `/api/predict` | Calculate delay risk score & return XAI factor breakdown |
| `GET` | `/api/alerts` | Fetch active early-warning alerts |
| `GET` | `/api/reports` | Fetch executive report summaries |
| `GET` | `/api/taluks` | Compute taluk comparative analytics |

---

## ⚙️ Installation & Setup Guide

### 1. Database Setup (MySQL)
Make sure MySQL server is running locally on port 3306, then run:
```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend Startup (Python Flask)
```bash
cd backend
pip install -r requirements.txt
python app.py
```
*The Flask backend will run on **`http://127.0.0.1:5000`**.*

### 3. Frontend Startup (HTTP Server)
Open a new terminal window:
```bash
cd frontend
python -m http.server 8000
```
*Open your browser at **`http://localhost:8000/login.html`**.*

---

## 🔑 Demo Credentials

- **District Administrator:** `admin@landguard.ai` / `admin123`
- **Land Acquisition Officer:** `officer@landguard.ai` / `officer123`

---

## 💡 Text Architecture Diagram

```
[ FRONTEND ] (HTML5 / CSS3 / Vanilla JS / Leaflet.js / Chart.js)
     │
     ▼  HTTP REST Requests (JSON)
[ BACKEND ] (Python Flask API on Port 5000)
     ├── routes/ (Auth, Dashboard, Projects, Predictions, Alerts, Reports)
     ├── services/risk_service.py (Multi-Factor Risk Prediction Engine)
     └── models/database.py (MySQL Connector Pool)
     │
     ▼  SQL Queries
[ DATABASE ] (MySQL: `landguard` - 48 Seed Projects, 7 Taluks)
```

---

## ⚠️ Prototype Data Disclaimer
*Prototype demonstration data. Not an official government dataset.*
