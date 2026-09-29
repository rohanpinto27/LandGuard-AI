/* ==========================================================================
   LANDGUARD AI - Authentication & Session Service
   Client-Side Authentication Guard & LocalStorage State
   ========================================================================== */

const LANDGUARD_AUTH = {
  // Demo accounts
  DEMO_USERS: {
    "admin@landguard.ai": {
      password: "admin123",
      name: "District Administrator",
      role: "Administrator",
      department: "Dakshina Kannada District Collectorate",
      avatarInitials: "DA"
    },
    "officer@landguard.ai": {
      password: "officer123",
      name: "Land Acquisition Officer",
      role: "Land Officer",
      department: "Special Land Acquisition Cell",
      avatarInitials: "LA"
    }
  },

  // Initialize Auth Guard
  initAuthGuard: function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const session = this.getSession();

    // If on login page and already logged in, redirect to dashboard
    if (currentPage === 'login.html' || currentPage === 'index.html') {
      if (session && session.loggedIn) {
        window.location.href = 'dashboard.html';
      }
      return;
    }

    // Protect all internal pages
    if (!session || !session.loggedIn) {
      window.location.href = 'login.html';
    }
  },

  // Perform Login
  login: function(email, password) {
    const user = this.DEMO_USERS[email.toLowerCase().trim()];
    if (user && user.password === password) {
      const sessionData = {
        email: email.toLowerCase().trim(),
        name: user.name,
        role: user.role,
        department: user.department,
        avatarInitials: user.avatarInitials,
        loggedIn: true,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem('landguard_session', JSON.stringify(sessionData));
      return { success: true, user: sessionData };
    }
    return { success: false, message: "Invalid email or password. Use demo credentials." };
  },

  // Logout
  logout: function() {
    localStorage.removeItem('landguard_session');
    window.location.href = 'login.html';
  },

  // Get active session
  getSession: function() {
    try {
      const raw = localStorage.getItem('landguard_session');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }
};

// Make accessible globally
window.LANDGUARD_AUTH = LANDGUARD_AUTH;
