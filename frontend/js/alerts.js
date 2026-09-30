/* ==========================================================================
   LANDGUARD AI - Alerts & Early Warnings Controller
   Filterable proactive alert feed & status handlers
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.location.pathname.includes('alerts.html')) {
    initAlertsPage();
  }
});

let currentAlertsData = [];

async function initAlertsPage() {
  currentAlertsData = await LANDGUARD_API.getAlerts();
  renderAlertsFeed('ALL');

  const filterBtns = document.querySelectorAll('.alert-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('btn-primary'));
      filterBtns.forEach(b => b.classList.add('btn-outline'));
      btn.classList.remove('btn-outline');
      btn.classList.add('btn-primary');

      const severity = btn.getAttribute('data-severity');
      renderAlertsFeed(severity);
    });
  });
}

function renderAlertsFeed(severity) {
  const container = document.getElementById('alerts-feed-container');
  if (!container) return;

  let filtered = currentAlertsData;
  if (severity !== 'ALL') {
    filtered = currentAlertsData.filter(a => a.severity === severity);
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="padding: 40px; text-align: center; color: var(--text-muted);">
        <i class="fa-solid fa-bell-slash" style="font-size: 32px; margin-bottom: 12px;"></i>
        <div>No alerts found for selected severity level</div>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(a => `
    <div class="card" style="margin-bottom: 16px; border-left: 5px solid ${a.severity === 'CRITICAL' || a.severity === 'HIGH' ? 'var(--risk-high)' : 'var(--risk-med)'};">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="badge ${a.severity === 'CRITICAL' || a.severity === 'HIGH' ? 'badge-high' : 'badge-med'}">${a.severity}</span>
          <span style="font-size: 12px; font-weight: 700; color: var(--blue-primary);">${a.projectID}</span>
          <span style="font-weight: 700; color: var(--navy-primary); font-size: 14px;">${a.projectName}</span>
        </div>
        <span style="font-size: 11px; color: var(--text-muted);">${a.timestamp}</span>
      </div>

      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; margin-left: 2px;">
        ${a.message}
      </p>

      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 10px;">
        <span style="font-size: 11px; color: var(--text-muted);">Status: ${a.status}</span>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-sm btn-outline" onclick="showToast('Alert marked as read', 'success')">
            <i class="fa-solid fa-check"></i> Mark Read
          </button>
          <a href="project-details.html?id=${a.projectID}" class="btn btn-sm btn-primary">
            Inspect Project <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </div>
  `).join('');
}
