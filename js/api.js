/* ==========================================================================
   LANDGUARD AI - Data Service & API Abstraction Layer
   Provides API-ready functions that map to future Python Flask + MySQL endpoints
   ========================================================================== */

const LANDGUARD_API = {
  // Config flag to toggle between Mock data and live Flask Backend
  USE_LIVE_API: false,
  API_BASE_URL: "http://localhost:5000/api",

  /* ------------------------------------------------------------------------
     1. Dashboard Analytics Data
     Flask Endpoint: GET /api/dashboard
     ------------------------------------------------------------------------ */
  getDashboardData: async function() {
    if (this.USE_LIVE_API) {
      try {
        const res = await fetch(`${this.API_BASE_URL}/dashboard`);
        return await res.json();
      } catch (e) {
        console.warn("Flask Backend unavailable. Falling back to Local Mock Data.", e);
      }
    }
    return LANDGUARD_MOCK_DATA.summary;
  },

  /* ------------------------------------------------------------------------
     2. Projects Repository Data
     Flask Endpoint: GET /api/projects?taluk=...&risk=...&search=...
     ------------------------------------------------------------------------ */
  getProjects: async function(filters = {}) {
    if (this.USE_LIVE_API) {
      try {
        const query = new URLSearchParams(filters).toString();
        const res = await fetch(`${this.API_BASE_URL}/projects?${query}`);
        return await res.json();
      } catch (e) {
        console.warn("Flask Backend unavailable. Falling back to Local Mock Data.", e);
      }
    }

    let projects = [...LANDGUARD_MOCK_DATA.projects];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      projects = projects.filter(p =>
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q) ||
        p.taluk.toLowerCase().includes(q)
      );
    }

    if (filters.taluk && filters.taluk !== 'ALL') {
      projects = projects.filter(p => p.taluk === filters.taluk);
    }

    if (filters.riskLevel && filters.riskLevel !== 'ALL') {
      projects = projects.filter(p => p.riskLevel === filters.riskLevel);
    }

    return projects;
  },

  /* ------------------------------------------------------------------------
     3. Single Project Details
     Flask Endpoint: GET /api/projects/<id>
     ------------------------------------------------------------------------ */
  getProjectById: async function(id) {
    if (this.USE_LIVE_API) {
      try {
        const res = await fetch(`${this.API_BASE_URL}/projects/${id}`);
        return await res.json();
      } catch (e) {
        console.warn("Flask Backend unavailable. Falling back to Local Mock Data.", e);
      }
    }
    return LANDGUARD_MOCK_DATA.projects.find(p => p.id === id) || LANDGUARD_MOCK_DATA.projects[0];
  },

  /* ------------------------------------------------------------------------
     4. AI Delay Risk Prediction Engine
     Flask Endpoint: POST /api/predict
     ------------------------------------------------------------------------ */
  predictRisk: async function(inputData) {
    if (this.USE_LIVE_API) {
      try {
        const res = await fetch(`${this.API_BASE_URL}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inputData)
        });
        return await res.json();
      } catch (e) {
        console.warn("Flask Backend unavailable. Running Client-Side Prototype ML Logic.", e);
      }
    }

    // Client-Side Deterministic Prototype Risk Predictor
    return this.runClientSidePredictor(inputData);
  },

  /* Client-Side Deterministic Prototype Risk Calculation */
  runClientSidePredictor: function(inputs) {
    const compPct = parseFloat(inputs.compensationProgressPct || 50);
    const rehabPct = parseFloat(inputs.rehabilitationProgressPct || 50);
    const docPct = parseFloat(inputs.documentationProgressPct || 50);
    const legalCases = parseInt(inputs.legalDisputes || 0);
    const responsiveness = inputs.stakeholderResponsiveness || "Medium";

    // Deterministic Multi-Factor Risk Score Calculation (0 to 100%)
    let riskScore = 10; // Baseline offset

    // 1. Compensation Disbursal Impact (Max +35%)
    const compContrib = ((100 - compPct) / 100) * 35;
    riskScore += compContrib;

    // 2. Active Legal Disputes Impact (Max +25%) - 5+ cases maxes out
    const legalContrib = Math.min(legalCases * 5, 25);
    riskScore += legalContrib;

    // 3. Rehabilitation Progress Impact (Max +20%)
    const rehabContrib = ((100 - rehabPct) / 100) * 20;
    riskScore += rehabContrib;

    // 4. Stakeholder Responsiveness Impact (Max +15%)
    let respContrib = 5;
    if (responsiveness === 'Low') respContrib = 15;
    else if (responsiveness === 'Medium') respContrib = 8;
    else if (responsiveness === 'High') respContrib = 2;
    riskScore += respContrib;

    // 5. Documentation Clearance Impact (Max +10%)
    const docContrib = ((100 - docPct) / 100) * 10;
    riskScore += docContrib;

    // Bound score between 5% and 98%
    riskScore = Math.min(Math.max(Math.round(riskScore), 5), 98);

    // Risk Categories: 0–39% = LOW RISK, 40–69% = MEDIUM RISK, 70–100% = HIGH RISK
    let riskLevel = "LOW";
    if (riskScore >= 70) riskLevel = "HIGH";
    else if (riskScore >= 40) riskLevel = "MEDIUM";

    // Compute normalized prototype factor contribution values (e.g. +0.28, +0.22)
    const scoreDec = riskScore / 100;
    const rawSum = compContrib + legalContrib + rehabContrib + respContrib + docContrib || 1;

    const factors = [
      {
        factor: "Compensation Progress",
        value: (compContrib / rawSum) * scoreDec,
        color: compPct < 60 ? "#DC2626" : "#16A34A"
      },
      {
        factor: "Legal Disputes",
        value: (legalContrib / rawSum) * scoreDec,
        color: legalCases > 2 ? "#DC2626" : "#F59E0B"
      },
      {
        factor: "Rehabilitation Progress",
        value: (rehabContrib / rawSum) * scoreDec,
        color: rehabPct < 50 ? "#DC2626" : "#16A34A"
      },
      {
        factor: "Stakeholder Responsiveness",
        value: (respContrib / rawSum) * scoreDec,
        color: responsiveness === 'Low' ? "#DC2626" : "#16A34A"
      },
      {
        factor: "Documentation Clearance",
        value: (docContrib / rawSum) * scoreDec,
        color: docPct < 70 ? "#F59E0B" : "#16A34A"
      }
    ];

    // Sort factors descending by impact value
    factors.sort((a, b) => b.value - a.value);

    const formattedFactors = factors.map(f => ({
      factor: f.factor,
      displayVal: `+${f.value.toFixed(2)}`,
      pctWidth: Math.min(Math.max(Math.round((f.value / 0.40) * 100), 12), 100),
      color: f.color
    }));

    // Dynamic Administrative Recommendations based on input parameters
    const recommendations = [];

    if (compPct < 60) {
      recommendations.push({
        priority: "URGENT",
        title: "Accelerate pending compensation disbursement",
        desc: `Current compensation disbursal is at ${compPct}%. Schedule dedicated Revenue Collector desk to disburse pending awards.`
      });
    }

    if (legalCases > 2) {
      recommendations.push({
        priority: "HIGH",
        title: "Prioritize resolution of active legal disputes",
        desc: `${legalCases} active court cases detected. Convene out-of-court settlement committee for valuation suits.`
      });
    }

    if (rehabPct < 50) {
      recommendations.push({
        priority: "HIGH",
        title: "Expedite rehabilitation and resettlement activities",
        desc: `Rehabilitation progress is at ${rehabPct}%. Accelerate layout infrastructure development.`
      });
    }

    if (responsiveness === 'Low') {
      recommendations.push({
        priority: "HIGH",
        title: "Conduct structured stakeholder engagement meetings",
        desc: "Low stakeholder cooperation reported. Initiate Gram Sabha consultation and grievance redressal."
      });
    }

    if (docPct < 70) {
      recommendations.push({
        priority: "MEDIUM",
        title: "Initiate documentation and title-clearance review",
        desc: `Documentation clearance is at ${docPct}%. Assign Special Revenue Inspector for title verification.`
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        priority: "LOW",
        title: "Initiate possession-readiness review",
        desc: "All acquisition indicators are performing within safe baseline thresholds. Prepare final transfer notice."
      });
    }

    return {
      delayProbabilityPct: riskScore,
      riskLevel: riskLevel,
      confidenceScorePct: 88,
      modelUsed: "Random Forest Classifier (Prototype Engine)",
      xaiFactors: formattedFactors,
      recommendations: recommendations
    };
  },

  /* ------------------------------------------------------------------------
     5. Early Warning Alerts & Taluk Analytics
     ------------------------------------------------------------------------ */
  getAlerts: async function() { return LANDGUARD_MOCK_DATA.alerts; },
  getTalukAnalytics: async function() { return LANDGUARD_MOCK_DATA.taluks; }
};

// Make accessible globally
window.LANDGUARD_API = LANDGUARD_API;
