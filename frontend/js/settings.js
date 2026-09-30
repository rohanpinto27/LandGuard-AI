/* ==========================================================================
   LANDGUARD AI - System Settings Controller
   Risk threshold customizers, notification toggles & system diagnostics
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('settings.html')) {
    initSettingsPage();
  }
});

function initSettingsPage() {
  const form = document.getElementById('settings-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('System settings and risk thresholds updated successfully!', 'success');
    });
  }
}
