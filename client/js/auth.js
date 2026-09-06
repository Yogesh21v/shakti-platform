const Auth = {
  mode: 'login', // or 'register'

  open(mode) {
    this.mode = mode;
    const isRegister = mode === 'register';
    document.getElementById('auth-title').textContent = isRegister ? 'Join ShaktiConnect' : 'Log In';
    document.getElementById('auth-submit-btn').textContent = isRegister ? 'Create Account →' : 'Log In →';
    document.getElementById('auth-field-name').style.display = isRegister ? 'block' : 'none';
    document.getElementById('auth-field-district').style.display = isRegister ? 'block' : 'none';
    document.getElementById('auth-field-skills').style.display = isRegister ? 'block' : 'none';
    document.getElementById('auth-error').style.display = 'none';

    const switchEl = document.getElementById('auth-switch');
    switchEl.textContent = isRegister
      ? 'Already have an account? Log in'
      : "New here? Create a free account";
    switchEl.onclick = () => Auth.open(isRegister ? 'login' : 'register');

    document.getElementById('modal-auth').classList.add('open');
  },

  close() {
    document.getElementById('modal-auth').classList.remove('open');
  },

  async submit() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const errorEl = document.getElementById('auth-error');
    errorEl.style.display = 'none';

    try {
      let data;
      if (this.mode === 'register') {
        const name = document.getElementById('auth-name').value.trim();
        const district = document.getElementById('auth-district').value;
        const skill = document.getElementById('auth-skill').value;
        if (!name || !email || !password) {
          throw new Error('Please fill in your name, email and password.');
        }
        data = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password, district, skills: skill ? [skill] : [] }),
        });
        showToast(`Welcome to ShaktiConnect, ${data.user.name}! 🌸`);
      } else {
        if (!email || !password) {
          throw new Error('Please enter your email and password.');
        }
        data = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        showToast(`Welcome back, ${data.user.name}! 👋`);
      }

      Session.save(data.token, data.user);
      this.close();
      this.refreshNav();
      // Refresh whatever page is open so it reflects the logged-in state (e.g. vote buttons, "your post" etc.)
      Members.load();
      Forum.loadPosts();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
    }
  },

  logout() {
    Session.clear();
    this.refreshNav();
    showToast('You have been logged out.');
    Forum.loadPosts();
  },

  refreshNav() {
    const user = Session.getUser();
    const loggedIn = !!user;
    document.getElementById('nav-login').style.display = loggedIn ? 'none' : 'inline-block';
    document.getElementById('nav-register').style.display = loggedIn ? 'none' : 'inline-block';
    document.getElementById('nav-account').style.display = loggedIn ? 'flex' : 'none';
    if (loggedIn) {
      document.getElementById('nav-account-avatar').textContent = user.name.charAt(0).toUpperCase();
      document.getElementById('nav-account-name').textContent = user.name;
    }
  },
};

document.addEventListener('DOMContentLoaded', () => Auth.refreshNav());

// Close auth modal when clicking the overlay background
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modal-auth').addEventListener('click', function (e) {
    if (e.target === this) Auth.close();
  });
});
