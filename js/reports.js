/* ==========================================================================
   LANDGUARD AI - Reports & Analytics Controller
   Taluk Comparison Visualizations, Report Generators & CSV Exporter
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.location.pathname.includes('reports.html')) {
    initReportsPage();
  }
});

let talukChartInstance = null;

async function initReportsPage() {
  const talukData = await LANDGUARD_API.getTalukAnalytics();

  // 1. Render Taluk Comparison Bar Chart
  renderTalukChart(talukData);

  // 2. Render Taluk Performance Summary Table
  renderTalukTable(talukData);
}

/* --------------------------------------------------------------------------
   1. Taluk Comparison Chart (Chart.js)
   -------------------------------------------------------------------------- */
function renderTalukChart(taluks) {
  const ctx = document.getElementById('talukChart');
  if (!ctx) return;

  if (talukChartInstance) {
    talukChartInstance.destroy();
  }

  const labels = taluks.map(t => t.name);
  const highRiskData = taluks.map(t => t.highRisk);
  const avgDelayData = taluks.map(t => t.avgDelayProb);

  talukChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'High Risk Projects',
          data: highRiskData,
          backgroundColor: '#DC2626',
          borderRadius: 4
        },
        {
          label: 'Avg Delay Risk (%)',
          data: avgDelayData,
          backgroundColor: '#1769E0',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          backgroundColor: '#0B1F3A',
          padding: 12
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#E2E8F0' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

/* --------------------------------------------------------------------------
   2. Taluk Performance Table
   -------------------------------------------------------------------------- */
function renderTalukTable(taluks) {
  const body = document.getElementById('taluk-table-body');
  if (!body) return;

  body.innerHTML = taluks.map(t => `
    <tr>
      <td style="font-weight: 700; color: var(--navy-primary);">${t.name}</td>
      <td>${t.projects}</td>
      <td>
        <span class="badge ${t.highRisk > 2 ? 'badge-high' : t.highRisk > 0 ? 'badge-med' : 'badge-low'}">
          ${t.highRisk} Projects
        </span>
      </td>
      <td><strong>${t.avgDelayProb}%</strong></td>
      <td>${t.compensationPaidPct}% Paid</td>
      <td>${t.legalDisputes} cases</td>
      <td>
        <a href="projects.html?taluk=${t.name}" class="btn btn-sm btn-outline">
          <i class="fa-solid fa-filter"></i> View Projects
        </a>
      </td>
    </tr>
  `).join('');
}

/* --------------------------------------------------------------------------
   3. Functional Client-Side CSV Exporter
   -------------------------------------------------------------------------- */
window.exportProjectsCSV = async function() {
  const projects = await LANDGUARD_API.getProjects();

  const headers = ["Project ID", "Name", "Taluk", "Village", "Project Type", "Land Area (Acres)", "Affected Families", "Compensation %", "Legal Disputes", "Delay Probability %", "Risk Level"];
  
  const rows = projects.map(p => [
    `"${p.id}"`,
    `"${p.name}"`,
    `"${p.taluk}"`,
    `"${p.village}"`,
    `"${p.projectType}"`,
    p.landAreaAcres,
    p.affectedFamilies,
    p.compensationProgressPct,
    p.legalDisputes,
    p.delayProbabilityPct,
    `"${p.riskLevel}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," 
    + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Dakshina_Kannada_LandGuard_Report_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Dakshina Kannada Land Acquisition CSV Report exported!', 'success');
};
