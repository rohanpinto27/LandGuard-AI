/* ==========================================================================
   LANDGUARD AI - AI Risk Analysis & Predictor Controller
   Interactive Form, Ready State, Animated Evaluation & Dynamic Predictions
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.location.pathname.includes('ai-analysis.html')) {
    initAIAnalysisPage();
  }
});

async function initAIAnalysisPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  if (projectId) {
    const project = await LANDGUARD_API.getProjectById(projectId);
    if (project) {
      prefillForm(project);
    }
  }

  // Ensure initial empty state is shown (no prediction pre-rendered)
  const emptyElem = document.getElementById('ai-empty-state');
  const loadingElem = document.getElementById('ai-loading-state');
  const resultElem = document.getElementById('ai-results-state');

  if (emptyElem) emptyElem.style.display = 'block';
  if (loadingElem) loadingElem.style.display = 'none';
  if (resultElem) resultElem.style.display = 'none';

  // Setup Form Submission Listener
  const form = document.getElementById('ai-predictor-form');
  if (form) {
    form.addEventListener('submit', handlePredictSubmit);
  }
}

function prefillForm(p) {
  if (document.getElementById('input-taluk')) document.getElementById('input-taluk').value = p.taluk || 'Mangaluru';
  if (document.getElementById('input-land-area')) document.getElementById('input-land-area').value = p.landAreaAcres || 42.5;
  if (document.getElementById('input-families')) document.getElementById('input-families').value = p.affectedFamilies || 86;
  
  if (document.getElementById('input-comp-pct')) {
    document.getElementById('input-comp-pct').value = p.compensationProgressPct || 48;
    const valComp = document.getElementById('val-comp');
    if (valComp) valComp.innerText = (p.compensationProgressPct || 48) + '%';
  }

  if (document.getElementById('input-rehab-pct')) {
    document.getElementById('input-rehab-pct').value = p.rehabilitationProgressPct || 32;
    const valRehab = document.getElementById('val-rehab');
    if (valRehab) valRehab.innerText = (p.rehabilitationProgressPct || 32) + '%';
  }

  if (document.getElementById('input-doc-pct')) {
    document.getElementById('input-doc-pct').value = p.documentationProgressPct || 68;
    const valDoc = document.getElementById('val-doc');
    if (valDoc) valDoc.innerText = (p.documentationProgressPct || 68) + '%';
  }

  if (document.getElementById('input-disputes')) document.getElementById('input-disputes').value = p.legalDisputes || 7;
  if (document.getElementById('input-responsiveness')) document.getElementById('input-responsiveness').value = p.stakeholderResponsiveness || 'Low';
}

async function handlePredictSubmit(e) {
  e.preventDefault();

  const inputs = {
    taluk: document.getElementById('input-taluk').value,
    landAreaAcres: document.getElementById('input-land-area').value,
    affectedFamilies: document.getElementById('input-families').value,
    compensationProgressPct: document.getElementById('input-comp-pct').value,
    rehabilitationProgressPct: document.getElementById('input-rehab-pct').value,
    documentationProgressPct: document.getElementById('input-doc-pct').value,
    legalDisputes: document.getElementById('input-disputes').value,
    stakeholderResponsiveness: document.getElementById('input-responsiveness').value
  };

  const emptyElem = document.getElementById('ai-empty-state');
  const loadingElem = document.getElementById('ai-loading-state');
  const resultElem = document.getElementById('ai-results-state');

  if (emptyElem) emptyElem.style.display = 'none';
  if (resultElem) resultElem.style.display = 'none';
  if (loadingElem) loadingElem.style.display = 'block';

  // Professional Step-by-Step Loading Animation
  const statusText = document.getElementById('loading-status-text');
  if (statusText) statusText.innerText = "Analyzing project risk...";
  await new Promise(r => setTimeout(r, 450));

  if (statusText) statusText.innerText = "Evaluating acquisition indicators...";
  await new Promise(r => setTimeout(r, 450));

  // Run dynamic risk prediction
  const prediction = await LANDGUARD_API.predictRisk(inputs);

  if (loadingElem) loadingElem.style.display = 'none';
  if (resultElem) resultElem.style.display = 'block';

  renderPredictionResults(prediction);
  showToast('AI Risk Analysis calculated successfully!', 'success');
}

function renderPredictionResults(res) {
  const probElem = document.getElementById('res-delay-prob');
  const levelElem = document.getElementById('res-risk-level');
  const confidenceElem = document.getElementById('res-confidence');
  const xaiContainer = document.getElementById('res-xai-factors');
  const recsContainer = document.getElementById('res-recommendations');

  if (probElem) probElem.innerText = `${res.delayProbabilityPct}%`;
  
  if (levelElem) {
    levelElem.innerText = `${res.riskLevel} RISK`;
    levelElem.className = `badge ${res.riskLevel === 'HIGH' ? 'badge-high' : res.riskLevel === 'MEDIUM' ? 'badge-med' : 'badge-low'}`;
    levelElem.style.fontSize = "13px";
    levelElem.style.padding = "5px 14px";
  }

  if (confidenceElem) confidenceElem.innerText = `Model Confidence: ${res.confidenceScorePct}%`;

  // Render Explainable Risk Factors (Prototype Values)
  if (xaiContainer) {
    xaiContainer.innerHTML = res.xaiFactors.map(f => `
      <div class="xai-bar-item" style="margin-bottom: 10px;">
        <div class="xai-bar-info" style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
          <span style="font-weight: 600; color: var(--navy-primary);">${f.factor}</span>
          <span style="font-weight: 700; color: ${f.color};">${f.displayVal}</span>
        </div>
        <div class="xai-bar-track" style="height: 8px; background: var(--bg-subtle); border-radius: 4px; overflow: hidden; border: 1px solid var(--border-color);">
          <div class="xai-bar-fill" style="width: ${f.pctWidth}%; height: 100%; background-color: ${f.color}; transition: width 0.8s ease;"></div>
        </div>
      </div>
    `).join('');
  }

  // Render Administrative Interventions
  if (recsContainer) {
    recsContainer.innerHTML = res.recommendations.map(r => `
      <div style="padding: 10px 14px; border-left: 3px solid ${r.priority === 'URGENT' ? 'var(--risk-high)' : r.priority === 'HIGH' ? 'var(--risk-med)' : 'var(--blue-primary)'}; background: var(--bg-subtle); border-radius: 4px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; font-weight: 700; font-size: 12.5px; color: var(--navy-primary);">
          <span>${r.title}</span>
          <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: ${r.priority === 'URGENT' ? 'var(--risk-high-bg)' : 'var(--blue-soft)'}; color: ${r.priority === 'URGENT' ? 'var(--risk-high)' : 'var(--blue-primary)'};">${r.priority}</span>
        </div>
        <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 3px;">${r.desc}</div>
      </div>
    `).join('');
  }
}
