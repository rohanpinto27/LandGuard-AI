/* ==========================================================================
   LANDGUARD AI - Dashboard Page Controller
   KPI Cards, Chart.js Visualizations, Mini GIS Map & Priority Tables
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.location.pathname.includes('dashboard.html') || window.location.pathname.endsWith('/')) {
    initDashboard();
  }
});

async function initDashboard() {
  const summary = await LANDGUARD_API.getDashboardData();
  const projects = await LANDGUARD_API.getProjects();

  // 1. Populate KPI Cards
  renderKPICards(summary);

  // 2. Render Delay Risk Trend Line Chart
  renderTrendChart();

  // 3. Render Risk Distribution Doughnut Chart
  renderDistributionChart(summary);

  // 4. Render Priority Attention Table
  renderPriorityTable(projects);

  // 5. Render Dashboard Mini Map
  renderDashboardMiniMap(projects);
}

/* --------------------------------------------------------------------------
   1. KPI Cards Renderer
   -------------------------------------------------------------------------- */
function renderKPICards(summary) {
  const container = document.getElementById('kpi-container');
  if (!container) return;

  container.innerHTML = `
    <div class="card kpi-card">
      <div class="kpi-top">
        <span class="kpi-label">Total Monitored Projects</span>
        <div class="kpi-icon blue"><i class="fa-solid fa-layer-group"></i></div>
      </div>
      <div class="kpi-value">${summary.totalProjects}</div>
      <div class="kpi-desc">
        <span style="color: var(--risk-low); font-weight: 600;"><i class="fa-solid fa-arrow-up"></i> 4 new</span>
        <span>this quarter</span>
      </div>
    </div>

    <div class="card kpi-card">
      <div class="kpi-top">
        <span class="kpi-label">High Risk Projects</span>
        <div class="kpi-icon red"><i class="fa-solid fa-triangle-exclamation"></i></div>
      </div>
      <div class="kpi-value" style="color: var(--risk-high);">${summary.highRiskCount}</div>
      <div class="kpi-desc">
        <span style="color: var(--risk-high); font-weight: 600;"><i class="fa-solid fa-arrow-up"></i> 8.3%</span>
        <span>vs previous month</span>
      </div>
    </div>

    <div class="card kpi-card">
      <div class="kpi-top">
        <span class="kpi-label">Avg Delay Probability</span>
        <div class="kpi-icon amber"><i class="fa-solid fa-gauge-high"></i></div>
      </div>
      <div class="kpi-value">${summary.avgDelayProbability}%</div>
      <div class="kpi-desc">
        <span>Dakshina Kannada Baseline</span>
      </div>
    </div>

    <div class="card kpi-card">
      <div class="kpi-top">
        <span class="kpi-label">Pending Compensation</span>
        <div class="kpi-icon teal"><i class="fa-solid fa-indian-rupee-sign"></i></div>
      </div>
      <div class="kpi-value">₹${summary.pendingCompensationCr} Cr</div>
      <div class="kpi-desc">
        <span>Across 18 acquisition blocks</span>
      </div>
    </div>
  `;
}

/* --------------------------------------------------------------------------
   2. Delay Risk Trend Line Chart
   -------------------------------------------------------------------------- */
let trendChartInstance = null;

function renderTrendChart() {
  const ctx = document.getElementById('trendChart');
  if (!ctx) return;

  if (trendChartInstance) {
    trendChartInstance.destroy();
  }

  trendChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['April', 'May', 'June', 'July', 'August', 'September'],
      datasets: [{
        label: 'Avg Delay Probability (%)',
        data: [42.1, 46.5, 51.0, 53.8, 55.2, 57.4],
        borderColor: '#1769E0',
        backgroundColor: 'rgba(23, 105, 224, 0.08)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#1769E0',
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0B1F3A',
          padding: 12,
          displayColors: false,
          callbacks: {
            label: (ctx) => ` Predicted Delay Risk: ${ctx.parsed.y}%`
          }
        }
      },
      scales: {
        y: {
          min: 30,
          max: 80,
          grid: { color: '#E2E8F0' },
          ticks: { callback: (val) => val + '%' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

/* --------------------------------------------------------------------------
   3. Risk Distribution Doughnut Chart
   -------------------------------------------------------------------------- */
let distChartInstance = null;

function renderDistributionChart(summary) {
  const ctx = document.getElementById('distChart');
  if (!ctx) return;

  if (distChartInstance) {
    distChartInstance.destroy();
  }

  distChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['High Risk', 'Medium Risk', 'Low Risk'],
      datasets: [{
        data: [summary.highRiskCount, summary.medRiskCount, summary.lowRiskCount],
        backgroundColor: ['#DC2626', '#F59E0B', '#16A34A'],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 12 } } },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${ctx.parsed} Projects`
          }
        }
      },
      onClick: (e, activeElements) => {
        if (activeElements.length > 0) {
          const index = activeElements[0].index;
          const levels = ['HIGH', 'MEDIUM', 'LOW'];
          window.location.href = `projects.html?risk=${levels[index]}`;
        }
      }
    }
  });
}

/* --------------------------------------------------------------------------
   4. Priority Attention Required Table
   -------------------------------------------------------------------------- */
function renderPriorityTable(projects) {
  const tableBody = document.getElementById('priority-table-body');
  if (!tableBody) return;

  const highRiskProjects = projects.filter(p => p.riskLevel === 'HIGH').slice(0, 5);

  tableBody.innerHTML = highRiskProjects.map(p => `
    <tr>
      <td>
        <div style="font-weight: 600; color: var(--navy-primary);">${p.name}</div>
        <div style="font-size: 11px; color: var(--text-muted);">${p.id} • ${p.village}</div>
      </td>
      <td>${p.taluk}</td>
      <td>
        <span class="badge badge-high">${p.delayProbabilityPct}% Risk</span>
      </td>
      <td>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="flex: 1; height: 6px; background: var(--border-color); border-radius: 4px; overflow: hidden;">
            <div style="width: ${p.compensationProgressPct}%; height: 100%; background: ${p.compensationProgressPct < 50 ? 'var(--risk-high)' : 'var(--risk-med)'};"></div>
          </div>
          <span style="font-size: 11px; font-weight: 600;">${p.compensationProgressPct}%</span>
        </div>
      </td>
      <td>
        <a href="project-details.html?id=${p.id}" class="btn btn-sm btn-outline">
          <i class="fa-solid fa-eye"></i> Details
        </a>
      </td>
    </tr>
  `).join('');
}

/* --------------------------------------------------------------------------
   5. Dashboard Mini Map (Leaflet.js)
   -------------------------------------------------------------------------- */
function renderDashboardMiniMap(projects) {
  const mapElem = document.getElementById('dashboard-mini-map');
  if (!mapElem || typeof L === 'undefined') return;

  // Initialize Map centered on Dakshina Kannada
  const map = L.map('dashboard-mini-map', {
    zoomControl: true,
    scrollWheelZoom: false
  }).setView([12.8702, 74.8806], 10);

  // Add OpenStreetMap tiles with offline safety fallback
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);

  // Plot Project Markers
  projects.forEach(p => {
    const color = p.riskLevel === 'HIGH' ? '#DC2626' : p.riskLevel === 'MEDIUM' ? '#F59E0B' : '#16A34A';
    
    const marker = L.circleMarker([p.latitude, p.longitude], {
      radius: 7,
      fillColor: color,
      color: '#FFFFFF',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9
    }).addTo(map);

    marker.bindPopup(`
      <div style="font-family: Inter, sans-serif; padding: 4px;">
        <div style="font-weight: 700; font-size: 13px; color: #0B1F3A;">${p.name}</div>
        <div style="font-size: 11px; color: #64748B; margin-bottom: 6px;">${p.id} • ${p.taluk} Taluk</div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 700; color: ${color};">${p.delayProbabilityPct}% Delay Risk</span>
          <span style="font-size: 10px; background: #F1F5F9; padding: 2px 6px; border-radius: 4px;">${p.riskLevel}</span>
        </div>
        <a href="project-details.html?id=${p.id}" style="display: inline-block; font-size: 11px; font-weight: 600; color: #1769E0;">View Details &rarr;</a>
      </div>
    `);
  });
}
