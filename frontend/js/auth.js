/* ==========================================================================
   LANDGUARD AI - Authentication & Session Service
   Communicates with Flask API (POST /api/auth/login) & LocalStorage Session
   ========================================================================== */

const LANDGUARD_AUTH = {
  API_URL: "http://127.0.0.1:5000/api/auth/login",

  // Demo fallback accounts
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

  // Initialize Auth Guard on page load
  initAuthGuard: function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const session = this.getSession();

    if (currentPage === 'login.html' || currentPage === 'index.html') {
      if (session && session.loggedIn) {
        window.location.href = 'dashboard.html';
      }
      return;
    }

    if (!session || !session.loggedIn) {
      window.location.href = 'login.html';
    }
  },

  // Asynchronous Login connecting to Flask Backend (POST /api/auth/login)
  loginAsync: async function(email, password) {
    try {
      const res = await fetch(this.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('landguard_session', JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
    } catch (e) {
      console.warn("[Auth] Flask auth API unreachable. Falling back to local verification.", e);
    }

    // Local Fallback Verification
    return this.login(email, password);
  },

  // Synchronous Local Fallback Login
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
    return { success: false, message: "Invalid email or password. Use admin@landguard.ai / admin123." };
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
