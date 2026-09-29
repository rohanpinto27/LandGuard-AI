/* ==========================================================================
   LANDGUARD AI - Global Application Controller
   Renders dynamic Sidebar, Topbar, Global Search, Notifications & Toast Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Check Authentication Session
  if (window.LANDGUARD_AUTH) {
    LANDGUARD_AUTH.initAuthGuard();
  }

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Do not render internal shell on Login page
  if (currentPage === 'login.html' || currentPage === 'index.html') {
    return;
  }

  // 1. Render Navigation Shell (Sidebar & Topbar)
  renderSidebar(currentPage);
  renderTopbar(currentPage);

  // 2. Setup Global Listeners (Search, Notifications, User Dropdown)
  setupGlobalEvents();
});

/* --------------------------------------------------------------------------
   1. Dynamic Sidebar Renderer
   -------------------------------------------------------------------------- */
function renderSidebar(activePage) {
  const sidebarContainer = document.getElementById('sidebar-container');
  if (!sidebarContainer) return;

  const session = LANDGUARD_AUTH.getSession() || { name: "Administrator", role: "Administrator", avatarInitials: "DA" };

  sidebarContainer.innerHTML = `
    <aside class="sidebar" id="app-sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo-icon">
          <i class="fa-solid fa-shield-halved"></i>
        </div>
        <div class="sidebar-brand">
          <span class="brand-title">LANDGUARD AI</span>
          <span class="brand-subtitle">Dakshina Kannada</span>
        </div>
      </div>

      <nav class="sidebar-menu">
        <div class="nav-section-label">Core Intelligence</div>
        
        <a href="dashboard.html" class="nav-item ${activePage === 'dashboard.html' ? 'active' : ''}">
          <i class="fa-solid fa-chart-pie"></i>
          <span>Dashboard</span>
        </a>
        
        <a href="projects.html" class="nav-item ${activePage === 'projects.html' || activePage === 'project-details.html' ? 'active' : ''}">
          <i class="fa-solid fa-folder-tree"></i>
          <span>Projects Repository</span>
        </a>
        
        <a href="risk-map.html" class="nav-item ${activePage === 'risk-map.html' ? 'active' : ''}">
          <i class="fa-solid fa-map-location-dot"></i>
          <span>Dakshina Kannada Map</span>
        </a>
        
        <a href="ai-analysis.html" class="nav-item ${activePage === 'ai-analysis.html' ? 'active' : ''}">
          <i class="fa-solid fa-brain"></i>
          <span>AI Risk Analysis</span>
        </a>
        
        <div class="nav-section-label">Monitoring & Reporting</div>
        
        <a href="alerts.html" class="nav-item ${activePage === 'alerts.html' ? 'active' : ''}">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span>Alerts & Early Warnings</span>
        </a>
        
        <a href="reports.html" class="nav-item ${activePage === 'reports.html' ? 'active' : ''}">
          <i class="fa-solid fa-file-invoice-dollar"></i>
          <span>Reports & Analytics</span>
        </a>
        
        <a href="settings.html" class="nav-item ${activePage === 'settings.html' ? 'active' : ''}">
          <i class="fa-solid fa-sliders"></i>
          <span>System Settings</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="user-profile-widget">
          <div class="user-avatar">
            ${session.avatarInitials}
            <span class="online-dot"></span>
          </div>
          <div class="user-info">
            <span class="user-name">${session.name}</span>
            <span class="user-role">${session.role}</span>
          </div>
        </div>
      </div>
    </aside>
  `;
}

/* --------------------------------------------------------------------------
   2. Dynamic Topbar Renderer
   -------------------------------------------------------------------------- */
function renderTopbar(activePage) {
  const topbarContainer = document.getElementById('topbar-container');
  if (!topbarContainer) return;

  const pageTitles = {
    'dashboard.html': 'Land Acquisition Risk Overview',
    'projects.html': 'Land Acquisition Projects',
    'project-details.html': 'Project Intelligence Profile',
    'risk-map.html': 'Dakshina Kannada GIS Risk Map',
    'ai-analysis.html': 'AI Risk Calculator & Predictor',
    'alerts.html': 'Alerts & Early Warning Hub',
    'reports.html': 'District Reports & Analytics',
    'settings.html': 'System Thresholds & Settings'
  };

  const title = pageTitles[activePage] || 'Land Acquisition Analytics';

  topbarContainer.innerHTML = `
    <header class="topbar">
      <div class="topbar-left">
        <h1 class="topbar-title">${title}</h1>
        <div class="topbar-location">
          <i class="fa-solid fa-location-dot" style="color: var(--blue-primary);"></i>
          <span>Dakshina Kannada District • Karnataka</span>
        </div>
      </div>

      <div class="topbar-right">
        <!-- Global Search Box -->
        <div class="search-container">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input type="text" id="global-search-input" class="search-input" placeholder="Search Project ID, Name or Village..." autocomplete="off">
          <div class="search-results-dropdown" id="global-search-results"></div>
        </div>

        <!-- AI Engine Status Badge -->
        <div class="ai-status-badge">
          <span class="pulse-dot"></span>
          <span>AI ENGINE — DEMO MODE</span>
        </div>

        <!-- Notification Bell -->
        <button class="notification-bell-btn" id="notif-btn" title="Notifications">
          <i class="fa-regular fa-bell"></i>
          <span class="bell-badge"></span>
        </button>

        <!-- Notification Flyout -->
        <div class="notifications-flyout" id="notif-flyout">
          <div class="flyout-header">
            <span class="flyout-title">Recent Alerts</span>
            <button class="btn-sm btn-outline" onclick="window.location.href='alerts.html'">View All</button>
          </div>
          <div class="flyout-body" id="notif-flyout-list">
            <!-- Dynamically populated -->
          </div>
        </div>

        <!-- Logout Button -->
        <button class="btn btn-sm btn-outline" onclick="LANDGUARD_AUTH.logout()" title="Sign Out">
          <i class="fa-solid fa-right-from-bracket"></i>
          <span>Logout</span>
        </button>
      </div>
    </header>
  `;
}

/* --------------------------------------------------------------------------
   3. Setup Global Event Handlers
   -------------------------------------------------------------------------- */
function setupGlobalEvents() {
  const searchInput = document.getElementById('global-search-input');
  const searchResults = document.getElementById('global-search-results');

  if (searchInput && searchResults) {
    searchInput.addEventListener('input', async (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (query.length < 2) {
        searchResults.classList.remove('active');
        searchResults.innerHTML = '';
        return;
      }

      const projects = await LANDGUARD_API.getProjects({ search: query });
      if (projects.length === 0) {
        searchResults.innerHTML = `<div style="padding: 12px; font-size: 12px; color: var(--text-muted); text-align: center;">No matching projects found</div>`;
      } else {
        searchResults.innerHTML = projects.slice(0, 5).map(p => `
          <div class="search-result-item" onclick="window.location.href='project-details.html?id=${p.id}'">
            <div>
              <div style="font-weight: 600; font-size: 13px; color: var(--navy-primary);">${p.name}</div>
              <div style="font-size: 11px; color: var(--text-secondary);">${p.id} • ${p.taluk} Taluk</div>
            </div>
            <span class="badge ${p.riskLevel === 'HIGH' ? 'badge-high' : p.riskLevel === 'MEDIUM' ? 'badge-med' : 'badge-low'}">
              ${p.delayProbabilityPct}% Risk
            </span>
          </div>
        `).join('');
      }
      searchResults.classList.add('active');
    });

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.remove('active');
      }
    });
  }

  const notifBtn = document.getElementById('notif-btn');
  const notifFlyout = document.getElementById('notif-flyout');
  const notifList = document.getElementById('notif-flyout-list');

  if (notifBtn && notifFlyout) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = notifFlyout.classList.contains('active');
      if (!isActive && notifList) {
        const alerts = LANDGUARD_MOCK_DATA.alerts.slice(0, 4);
        notifList.innerHTML = alerts.map(a => `
          <div class="notification-item">
            <div style="font-weight: 600; color: ${a.severity === 'CRITICAL' || a.severity === 'HIGH' ? 'var(--risk-high)' : 'var(--risk-med)'};">
              [${a.severity}] ${a.projectID}
            </div>
            <div style="margin-top: 2px;">${a.message}</div>
            <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">${a.timestamp}</div>
          </div>
        `).join('');
      }
      notifFlyout.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!notifFlyout.contains(e.target) && e.target !== notifBtn) {
        notifFlyout.classList.remove('active');
      }
    });
  }
}

/* --------------------------------------------------------------------------
   4. Global Toast Notification Function
   -------------------------------------------------------------------------- */
window.showToast = function(message, type = 'info') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-info'}"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};
