// ---------------------------------------------------------------------------
// All communication with the backend goes through this one file.
// Change API_BASE if you deploy the backend somewhere other than localhost.
// ---------------------------------------------------------------------------

const API_BASE = (window.SHAKTI_API_BASE) || 'http://localhost:5000/api';

const Session = {
  getToken() {
    return localStorage.getItem('sk_token');
  },
  getUser() {
    try {
      return JSON.parse(localStorage.getItem('sk_user') || 'null');
    } catch (e) {
      return null;
    }
  },
  save(token, user) {
    localStorage.setItem('sk_token', token);
    localStorage.setItem('sk_user', JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem('sk_token');
    localStorage.removeItem('sk_user');
  },
  isLoggedIn() {
    return !!this.getToken();
  },
};

async function apiFetch(path, options = {}) {
  const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
  const token = Session.getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  let res;
  try {
    res = await fetch(API_BASE + path, Object.assign({}, options, { headers }));
  } catch (networkErr) {
    throw new Error(
      "Can't reach the server. Make sure the backend is running (npm run dev in the server folder)."
    );
  }

  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    /* empty body is fine for some endpoints */
  }

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}
