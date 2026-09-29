/* ==========================================================================
   LANDGUARD AI - Project Details & XAI Controller
   Renders lifecycle timeline, animated SVG risk meter & SHAP contribution bars
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.location.pathname.includes('project-details.html')) {
    initProjectDetailsPage();
  }
});

async function initProjectDetailsPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id') || 'DK-LA-001';

  const project = await LANDGUARD_API.getProjectById(projectId);
  if (!project) return;

  // 1. Render Header & Banner
  renderHeader(project);

  // 2. Render Project KPIs
  renderProjectKPIs(project);

  // 3. Render Lifecycle Timeline
  renderLifecycleTimeline(project);

  // 4. Render Animated AI Risk Gauge SVG
  renderRiskGauge(project);

  // 5. Render Explainable AI (SHAP) Factor Bars
  renderXAIBars(project);

  // 6. Render Recommended Interventions
  renderRecommendations(project);
}

/* --------------------------------------------------------------------------
   1. Header Renderer
   -------------------------------------------------------------------------- */
function renderHeader(p) {
  const container = document.getElementById('project-header-container');
  if (!container) return;

  const riskClass = p.riskLevel === 'HIGH' ? 'badge-high' : p.riskLevel === 'MEDIUM' ? 'badge-med' : 'badge-low';

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
      <div>
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
          <span style="font-size: 13px; font-weight: 700; color: var(--blue-primary); background: var(--blue-soft); padding: 2px 8px; border-radius: 4px;">${p.id}</span>
          <span class="badge ${riskClass}">${p.delayProbabilityPct}% Predicted Delay Risk</span>
          <span style="font-size: 12px; color: var(--text-muted);">${p.status}</span>
        </div>
        <h1 style="font-size: 24px; color: var(--navy-primary); margin-bottom: 4px;">${p.name}</h1>
        <div style="font-size: 13px; color: var(--text-secondary);">
          <i class="fa-solid fa-location-dot" style="color: var(--blue-primary);"></i> ${p.village} Village • ${p.taluk} Taluk • Dakshina Kannada District
        </div>
      </div>

      <div style="display: flex; gap: 10px;">
        <a href="ai-analysis.html?id=${p.id}" class="btn btn-primary">
          <i class="fa-solid fa-brain"></i> Run Custom AI Analysis
        </a>
        <button class="btn btn-outline" onclick="showToast('Exporting Project Intelligence PDF...', 'info')">
          <i class="fa-solid fa-download"></i> Export PDF Report
        </button>
      </div>
    </div>
  `;
}

/* --------------------------------------------------------------------------
   2. Project KPIs
   -------------------------------------------------------------------------- */
function renderProjectKPIs(p) {
  const container = document.getElementById('project-kpis-container');
  if (!container) return;

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px;">
      <div class="card" style="padding: 14px;">
        <div style="font-size: 11px; text-transform: uppercase; color: var(--text-secondary); font-weight: 600;">Land Required</div>
        <div style="font-size: 20px; font-weight: 800; color: var(--navy-primary); margin-top: 4px;">${p.landAreaAcres} Acres</div>
      </div>
      <div class="card" style="padding: 14px;">
        <div style="font-size: 11px; text-transform: uppercase; color: var(--text-secondary); font-weight: 600;">Affected Families</div>
        <div style="font-size: 20px; font-weight: 800; color: var(--navy-primary); margin-top: 4px;">${p.affectedFamilies}</div>
      </div>
      <div class="card" style="padding: 14px;">
        <div style="font-size: 11px; text-transform: uppercase; color: var(--text-secondary); font-weight: 600;">Compensation Paid</div>
        <div style="font-size: 20px; font-weight: 800; color: ${p.compensationProgressPct < 50 ? 'var(--risk-high)' : 'var(--risk-low)'}; margin-top: 4px;">${p.compensationProgressPct}%</div>
      </div>
      <div class="card" style="padding: 14px;">
        <div style="font-size: 11px; text-transform: uppercase; color: var(--text-secondary); font-weight: 600;">Rehabilitation</div>
        <div style="font-size: 20px; font-weight: 800; color: var(--navy-primary); margin-top: 4px;">${p.rehabilitationProgressPct}%</div>
      </div>
      <div class="card" style="padding: 14px;">
        <div style="font-size: 11px; text-transform: uppercase; color: var(--text-secondary); font-weight: 600;">Active Litigation</div>
        <div style="font-size: 20px; font-weight: 800; color: ${p.legalDisputes > 3 ? 'var(--risk-high)' : 'var(--navy-primary)'}; margin-top: 4px;">${p.legalDisputes} cases</div>
      </div>
      <div class="card" style="padding: 14px;">
        <div style="font-size: 11px; text-transform: uppercase; color: var(--text-secondary); font-weight: 600;">Documentation</div>
        <div style="font-size: 20px; font-weight: 800; color: var(--navy-primary); margin-top: 4px;">${p.documentationProgressPct}%</div>
      </div>
    </div>
  `;
}

/* --------------------------------------------------------------------------
   3. Lifecycle Timeline
   -------------------------------------------------------------------------- */
function renderLifecycleTimeline(p) {
  const container = document.getElementById('project-timeline-container');
  if (!container) return;

  const timeline = p.timeline || [
    { stage: "Project Approval", status: "completed", date: "2025-01-10" },
    { stage: "Land Identification", status: "completed", date: "2025-03-15" },
    { stage: "Notification", status: "completed", date: "2025-06-20" },
    { stage: "Compensation Processing", status: "delayed", date: "2026-01-15" },
    { stage: "Legal Clearance", status: "pending", date: "In Dispute" },
    { stage: "Possession Handover", status: "pending", date: "TBD" },
    { stage: "Rehabilitation", status: "pending", date: "TBD" }
  ];

  container.innerHTML = `
    <div class="timeline-stepper">
      ${timeline.map((t, idx) => `
        <div class="timeline-step ${t.status}">
          <div class="step-node">
            ${t.status === 'completed' ? '<i class="fa-solid fa-check"></i>' : t.status === 'delayed' ? '<i class="fa-solid fa-exclamation"></i>' : (idx + 1)}
          </div>
          <div class="step-label">${t.stage}</div>
          <div class="step-date">${t.date}</div>
        </div>
      `).join('')}
    </div>
  `;
}

/* --------------------------------------------------------------------------
   4. Animated Circular Risk Gauge SVG
   -------------------------------------------------------------------------- */
function renderRiskGauge(p) {
  const percentElem = document.getElementById('gauge-percent-text');
  const levelElem = document.getElementById('gauge-level-text');
  const circleProgress = document.getElementById('gauge-progress-circle');

  if (!percentElem || !circleProgress) return;

  const pct = p.delayProbabilityPct;
  percentElem.innerText = `${pct}%`;
  
  if (levelElem) {
    levelElem.innerText = `${p.riskLevel} RISK`;
    levelElem.style.color = p.riskLevel === 'HIGH' ? 'var(--risk-high)' : p.riskLevel === 'MEDIUM' ? 'var(--risk-med)' : 'var(--risk-low)';
  }

  // Calculate SVG dash offset for 440 circumference
  const circumference = 440;
  const offset = circumference - (pct / 100) * circumference;

  setTimeout(() => {
    circleProgress.style.strokeDashoffset = offset;
    circleProgress.style.stroke = p.riskLevel === 'HIGH' ? '#DC2626' : p.riskLevel === 'MEDIUM' ? '#F59E0B' : '#16A34A';
  }, 100);
}

/* --------------------------------------------------------------------------
   5. Explainable AI (XAI) Feature Bars
   -------------------------------------------------------------------------- */
function renderXAIBars(p) {
  const container = document.getElementById('xai-bars-container');
  if (!container) return;

  const factors = p.xaiFactors || [
    { factor: "Compensation Processing Lag", impact: "High Impact", weightPct: 88, color: "#DC2626" },
    { factor: "Pending Legal Disputes", impact: "High Impact", weightPct: 82, color: "#DC2626" },
    { factor: "Rehabilitation Backlog", impact: "Medium Impact", weightPct: 65, color: "#F59E0B" }
  ];

  container.innerHTML = factors.map(f => `
    <div class="xai-bar-item">
      <div class="xai-bar-info">
        <span style="color: var(--navy-primary);">${f.factor}</span>
        <span style="color: ${f.color}; font-weight: 700;">${f.impact} (${f.weightPct}%)</span>
      </div>
      <div class="xai-bar-track">
        <div class="xai-bar-fill" style="width: ${f.weightPct}%; background-color: ${f.color};"></div>
      </div>
    </div>
  `).join('');
}

/* --------------------------------------------------------------------------
   6. Recommended Interventions
   -------------------------------------------------------------------------- */
function renderRecommendations(p) {
  const container = document.getElementById('recommendations-container');
  if (!container) return;

  const recs = p.recommendations || [
    { priority: "URGENT", title: "Prioritize Compensation Disbursal", desc: "Allocate Special Revenue Collector desk to clear pending claims." }
  ];

  container.innerHTML = recs.map((r, idx) => `
    <div style="padding: 16px; border-left: 4px solid ${r.priority === 'URGENT' ? 'var(--risk-high)' : 'var(--blue-primary)'}; background: var(--bg-subtle); border-radius: 0 var(--radius-md) var(--radius-md) 0; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 11px; font-weight: 700; background: var(--navy-primary); color: #FFF; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">0${idx+1}</span>
          <span style="font-weight: 700; color: var(--navy-primary);">${r.title}</span>
        </div>
        <span class="badge ${r.priority === 'URGENT' ? 'badge-high' : 'badge-med'}">${r.priority}</span>
      </div>
      <div style="font-size: 12.5px; color: var(--text-secondary); margin-left: 28px;">${r.desc}</div>
    </div>
  `).join('');
}
