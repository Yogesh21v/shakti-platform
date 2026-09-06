// --- NAVIGATION ---
function showPage(page) {
  document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('active'));
  const navEl = document.getElementById('nav-' + page);
  if (navEl) navEl.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- LANG (visual switch only for now — see README for adding full translations) ---
function setLang(el) {
  document.querySelectorAll('.lang-btn').forEach((b) => b.classList.remove('active'));
  el.classList.add('active');
  const langs = { EN: 'English', తె: 'Telugu', த: 'Tamil' };
  showToast('Language set to ' + langs[el.textContent] + ' (full translation coming soon!)');
}

// --- INITIAL LOAD ---
document.addEventListener('DOMContentLoaded', () => {
  Auth.refreshNav();
  Forum.loadCategories();
  Forum.loadMentors();
  Forum.loadPosts();
  Business.loadSchemes();
  Business.loadIdeas();
  Legal.loadHelplines();
  Legal.loadCategories();
  Members.load();
});
