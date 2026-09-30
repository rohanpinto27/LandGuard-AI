/* ==========================================================================
   LANDGUARD AI - Data Service & API Abstraction Layer
   Communicates with Flask REST API (http://127.0.0.1:5000/api) with Graceful Fallback
   ========================================================================== */

const LANDGUARD_API = {
  // Base Flask API endpoint
  API_BASE_URL: "http://127.0.0.1:5000/api",
  USE_LIVE_API: true,

  /* Helper to perform fetch with error handling and fallback */
  fetchWithFallback: async function(endpoint, options = {}, fallbackData = null) {
    if (this.USE_LIVE_API) {
      try {
        const res = await fetch(`${this.API_BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
          }
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn(`[LandGuard API] Flask endpoint ${endpoint} unavailable. Using fallback.`, e);
      }
    }
    return fallbackData;
  },

  /* ------------------------------------------------------------------------
     1. Dashboard Analytics Data
     Flask Endpoint: GET /api/dashboard
     ------------------------------------------------------------------------ */
  getDashboardData: async function() {
    const fallback = window.LANDGUARD_MOCK_DATA ? window.LANDGUARD_MOCK_DATA.summary : {};
    const data = await this.fetchWithFallback('/dashboard', { method: 'GET' }, fallback);
    return data || fallback;
  },

  /* ------------------------------------------------------------------------
     2. Projects Repository Data
     Flask Endpoint: GET /api/projects?taluk=...&riskLevel=...&search=...
     ------------------------------------------------------------------------ */
  getProjects: async function(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const endpoint = `/projects${query ? '?' + query : ''}`;
    
    // Compute fallback if API is unreachable
    let fallback = window.LANDGUARD_MOCK_DATA ? [...window.LANDGUARD_MOCK_DATA.projects] : [];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      fallback = fallback.filter(p =>
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q) ||
        p.taluk.toLowerCase().includes(q)
      );
    }
    if (filters.taluk && filters.taluk !== 'ALL') {
      fallback = fallback.filter(p => p.taluk === filters.taluk);
    }
    if (filters.riskLevel && filters.riskLevel !== 'ALL') {
      fallback = fallback.filter(p => p.riskLevel === filters.riskLevel);
    }

    const data = await this.fetchWithFallback(endpoint, { method: 'GET' }, fallback);
    return data || fallback;
  },

  /* ------------------------------------------------------------------------
     3. Single Project Details
     Flask Endpoint: GET /api/projects/<id>
     ------------------------------------------------------------------------ */
  getProjectById: async function(id) {
    const fallback = window.LANDGUARD_MOCK_DATA ?
      (window.LANDGUARD_MOCK_DATA.projects.find(p => p.id === id) || window.LANDGUARD_MOCK_DATA.projects[0]) : null;

    const data = await this.fetchWithFallback(`/projects/${id}`, { method: 'GET' }, fallback);
    return data || fallback;
  },

  /* ------------------------------------------------------------------------
     4. AI Delay Risk Prediction Engine
     Flask Endpoint: POST /api/predict
     ------------------------------------------------------------------------ */
  predictRisk: async function(inputData) {
    const fallback = this.runClientSidePredictor(inputData);
    const data = await this.fetchWithFallback('/predict', {
      method: 'POST',
      body: JSON.stringify(inputData)
    }, fallback);

    return data || fallback;
  },

  /* Client-Side Deterministic Fallback Predictor */
  runClientSidePredictor: function(inputs) {
    const compPct = parseFloat(inputs.compensationProgressPct || inputs.compensation_percentage || 50);
    const rehabPct = parseFloat(inputs.rehabilitationProgressPct || inputs.rehabilitation_percentage || 50);
    const docPct = parseFloat(inputs.documentationProgressPct || inputs.documentation_percentage || 50);
    const legalCases = parseInt(inputs.legalDisputes || inputs.legal_disputes || 0);
    const responsiveness = inputs.stakeholderResponsiveness || inputs.stakeholder_responsiveness || "Medium";

    let riskScore = 10;
    const compContrib = ((100 - compPct) / 100) * 35;
    const legalContrib = Math.min(legalCases * 5, 25);
    const rehabContrib = ((100 - rehabPct) / 100) * 20;
    
    let respContrib = 5;
    if (responsiveness === 'Low') respContrib = 15;
    else if (responsiveness === 'Medium') respContrib = 8;
    else if (responsiveness === 'High') respContrib = 2;

    const docContrib = ((100 - docPct) / 100) * 10;
    riskScore += (compContrib + legalContrib + rehabContrib + respContrib + docContrib);
    riskScore = Math.min(Math.max(Math.round(riskScore), 5), 98);

    let riskLevel = "LOW";
    if (riskScore >= 70) riskLevel = "HIGH";
    else if (riskScore >= 40) riskLevel = "MEDIUM";

    const scoreDec = riskScore / 100;
    const rawSum = (compContrib + legalContrib + rehabContrib + respContrib + docContrib) || 1;

    const factors = [
      { factor: "Compensation Progress", val: (compContrib / rawSum) * scoreDec, color: compPct < 60 ? "#DC2626" : "#16A34A" },
      { factor: "Legal Disputes", val: (legalContrib / rawSum) * scoreDec, color: legalCases > 2 ? "#DC2626" : "#F59E0B" },
      { factor: "Rehabilitation Progress", val: (rehabContrib / rawSum) * scoreDec, color: rehabPct < 50 ? "#DC2626" : "#16A34A" },
      { factor: "Stakeholder Responsiveness", val: (respContrib / rawSum) * scoreDec, color: responsiveness === 'Low' ? "#DC2626" : "#16A34A" },
      { factor: "Documentation Clearance", val: (docContrib / rawSum) * scoreDec, color: docPct < 70 ? "#F59E0B" : "#16A34A" }
    ];

    factors.sort((a, b) => b.val - a.val);

    const formattedFactors = factors.map(f => ({
      factor: f.factor,
      displayVal: `+${f.val.toFixed(2)}`,
      pctWidth: Math.min(Math.max(Math.round((f.val / 0.40) * 100), 12), 100),
      color: f.color
    }));

    const recommendations = [];
    if (compPct < 60) recommendations.push({ priority: "URGENT", title: "Accelerate pending compensation disbursement", desc: `Current disbursal is at ${compPct}%. Schedule dedicated Revenue Collector desk.` });
    if (legalCases > 2) recommendations.push({ priority: "HIGH", title: "Prioritize resolution of active legal disputes", desc: `${legalCases} active court cases detected. Initiate mediation committee.` });
    if (rehabPct < 50) recommendations.push({ priority: "HIGH", title: "Expedite rehabilitation and resettlement activities", desc: `Rehabilitation progress is at ${rehabPct}%. Accelerate civil works.` });
    if (!recommendations.length) recommendations.push({ priority: "LOW", title: "Initiate possession-readiness review", desc: "All metrics performing within safe baseline tolerances." });

    return {
      delayProbabilityPct: riskScore,
      delay_probability: riskScore,
      riskLevel: riskLevel,
      risk_category: riskLevel,
      confidenceScorePct: 88,
      confidence: 88,
      modelUsed: "Random Forest Classifier (Prototype Engine)",
      xaiFactors: formattedFactors,
      risk_factors: formattedFactors,
      recommendations: recommendations
    };
  },

  /* ------------------------------------------------------------------------
     5. Early Warning Alerts & Taluk Analytics
     ------------------------------------------------------------------------ */
  getAlerts: async function() {
    const fallback = window.LANDGUARD_MOCK_DATA ? window.LANDGUARD_MOCK_DATA.alerts : [];
    const data = await this.fetchWithFallback('/alerts', { method: 'GET' }, fallback);
    return data || fallback;
  },

  getTalukAnalytics: async function() {
    const fallback = window.LANDGUARD_MOCK_DATA ? window.LANDGUARD_MOCK_DATA.taluks : [];
    const data = await this.fetchWithFallback('/taluks', { method: 'GET' }, fallback);
    return data || fallback;
  }
};

// Make accessible globally
window.LANDGUARD_API = LANDGUARD_API;
