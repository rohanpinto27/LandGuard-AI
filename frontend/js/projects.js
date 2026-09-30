/* ==========================================================================
   LANDGUARD AI - Projects Repository Controller
   Grid / List view toggles, Multi-filter, Search & Pagination
   ========================================================================== */

let currentProjectsView = 'list'; // 'list' or 'grid'
let currentProjectsData = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (window.location.pathname.includes('projects.html')) {
    initProjectsPage();
  }
});

async function initProjectsPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const filterRisk = urlParams.get('risk') || 'ALL';
  const filterTaluk = urlParams.get('taluk') || 'ALL';

  const riskSelect = document.getElementById('filter-risk');
  const talukSelect = document.getElementById('filter-taluk');

  if (riskSelect && filterRisk !== 'ALL') riskSelect.value = filterRisk;
  if (talukSelect && filterTaluk !== 'ALL') talukSelect.value = filterTaluk;

  // Load Initial Projects
  await fetchAndRenderProjects();

  // Setup Event Listeners
  setupProjectsListeners();
}

async function fetchAndRenderProjects() {
  const searchInput = document.getElementById('projects-search');
  const riskSelect = document.getElementById('filter-risk');
  const talukSelect = document.getElementById('filter-taluk');

  const filters = {
    search: searchInput ? searchInput.value.trim() : '',
    riskLevel: riskSelect ? riskSelect.value : 'ALL',
    taluk: talukSelect ? talukSelect.value : 'ALL'
  };

  currentProjectsData = await LANDGUARD_API.getProjects(filters);
  renderProjectsDisplay(filters);
}

function renderProjectsDisplay(filters = {}) {
  const container = document.getElementById('projects-container');
  const countElem = document.getElementById('project-count-badge');
  if (!container) return;

  const totalCount = LANDGUARD_MOCK_DATA.summary.totalProjects;
  const isFiltered = (filters.search || (filters.riskLevel && filters.riskLevel !== 'ALL') || (filters.taluk && filters.taluk !== 'ALL'));

  if (countElem) {
    if (isFiltered) {
      countElem.innerText = `${currentProjectsData.length} Projects Found (Filtered from ${totalCount} Monitored Projects)`;
    } else {
      countElem.innerText = `${currentProjectsData.length} Projects Monitored across Dakshina Kannada`;
    }
  }

  if (currentProjectsData.length === 0) {
    container.innerHTML = `
      <div style="padding: 40px; text-align: center; color: var(--text-muted); width: 100%;">
        <i class="fa-solid fa-folder-open" style="font-size: 32px; margin-bottom: 12px;"></i>
        <div>No projects match the selected search criteria</div>
      </div>
    `;
    return;
  }

  if (currentProjectsView === 'list') {
    // Render Table View
    container.innerHTML = `
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Project ID</th>
              <th>Project Name & Location</th>
              <th>Taluk</th>
              <th>Land Area</th>
              <th>Families</th>
              <th>Compensation</th>
              <th>Rehabilitation</th>
              <th>Disputes</th>
              <th>Risk Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${currentProjectsData.map(p => `
              <tr>
                <td style="font-weight: 700; color: var(--navy-primary);">${p.id}</td>
                <td>
                  <div style="font-weight: 600; color: var(--navy-primary);">${p.name}</div>
                  <div style="font-size: 11px; color: var(--text-muted);">${p.village} Village</div>
                </td>
                <td>${p.taluk}</td>
                <td>${p.landAreaAcres} Acres</td>
                <td>${p.affectedFamilies}</td>
                <td>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <div style="flex: 1; height: 5px; background: var(--border-color); border-radius: 4px; overflow: hidden;">
                      <div style="width: ${p.compensationProgressPct}%; height: 100%; background: ${p.compensationProgressPct < 50 ? 'var(--risk-high)' : 'var(--risk-low)'};"></div>
                    </div>
                    <span style="font-size: 11px;">${p.compensationProgressPct}%</span>
                  </div>
                </td>
                <td>${p.rehabilitationProgressPct}%</td>
                <td>
                  <span style="font-weight: 700; color: ${p.legalDisputes > 3 ? 'var(--risk-high)' : 'var(--text-primary)'};">
                    ${p.legalDisputes}
                  </span>
                </td>
                <td>
                  <span class="badge ${p.riskLevel === 'HIGH' ? 'badge-high' : p.riskLevel === 'MEDIUM' ? 'badge-med' : 'badge-low'}">
                    ${p.delayProbabilityPct}% Risk
                  </span>
                </td>
                <td>
                  <div style="display: flex; gap: 6px;">
                    <a href="project-details.html?id=${p.id}" class="btn btn-sm btn-outline" title="View Profile">
                      <i class="fa-solid fa-eye"></i> View
                    </a>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else {
    // Render Card Grid View
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; width: 100%;">
        ${currentProjectsData.map(p => `
          <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <span style="font-size: 11px; font-weight: 700; color: var(--text-muted);">${p.id}</span>
                <span class="badge ${p.riskLevel === 'HIGH' ? 'badge-high' : p.riskLevel === 'MEDIUM' ? 'badge-med' : 'badge-low'}">
                  ${p.delayProbabilityPct}% ${p.riskLevel}
                </span>
              </div>
              <h3 style="font-size: 15px; margin-bottom: 6px; color: var(--navy-primary);">${p.name}</h3>
              <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 14px;">
                <i class="fa-solid fa-location-dot" style="color: var(--blue-primary);"></i> ${p.village}, ${p.taluk} Taluk
              </div>

              <div style="background: var(--bg-subtle); padding: 12px; border-radius: var(--radius-md); font-size: 12px; margin-bottom: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div><strong>Land:</strong> ${p.landAreaAcres} Acres</div>
                <div><strong>Families:</strong> ${p.affectedFamilies}</div>
                <div><strong>Compensation:</strong> ${p.compensationProgressPct}%</div>
                <div><strong>Disputes:</strong> ${p.legalDisputes} cases</div>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; gap: 8px; border-top: 1px solid var(--border-color); padding-top: 12px;">
              <a href="project-details.html?id=${p.id}" class="btn btn-sm btn-outline" style="flex: 1;">
                <i class="fa-solid fa-circle-info"></i> Details
              </a>
              <a href="ai-analysis.html?id=${p.id}" class="btn btn-sm btn-primary" style="flex: 1;">
                <i class="fa-solid fa-brain"></i> Analyze AI
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

function setupProjectsListeners() {
  const searchInput = document.getElementById('projects-search');
  const riskSelect = document.getElementById('filter-risk');
  const talukSelect = document.getElementById('filter-taluk');
  const viewListBtn = document.getElementById('btn-view-list');
  const viewGridBtn = document.getElementById('btn-view-grid');

  if (searchInput) searchInput.addEventListener('input', fetchAndRenderProjects);
  if (riskSelect) riskSelect.addEventListener('change', fetchAndRenderProjects);
  if (talukSelect) talukSelect.addEventListener('change', fetchAndRenderProjects);

  if (viewListBtn && viewGridBtn) {
    viewListBtn.addEventListener('click', () => {
      currentProjectsView = 'list';
      viewListBtn.classList.add('btn-primary');
      viewListBtn.classList.remove('btn-outline');
      viewGridBtn.classList.add('btn-outline');
      viewGridBtn.classList.remove('btn-primary');
      fetchAndRenderProjects();
    });

    viewGridBtn.addEventListener('click', () => {
      currentProjectsView = 'grid';
      viewGridBtn.classList.add('btn-primary');
      viewGridBtn.classList.remove('btn-outline');
      viewListBtn.classList.add('btn-outline');
      viewListBtn.classList.remove('btn-primary');
      fetchAndRenderProjects();
    });
  }
}
