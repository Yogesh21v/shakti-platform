const Business = {
  async loadSchemes() {
    const el = document.getElementById('schemes-list');
    try {
      const data = await apiFetch('/business/schemes');
      el.innerHTML = data.schemes
        .map(
          (s) =>
            `<span class="scheme-badge" onclick="showToast('${escapeHtml(s.info).replace(/'/g, "\\'")}')">${escapeHtml(s.name)}</span>`
        )
        .join('');
    } catch (err) {
      el.innerHTML = '';
    }
  },

  async loadIdeas() {
    const grid = document.getElementById('business-ideas-grid');
    try {
      const data = await apiFetch('/business/ideas');
      grid.innerHTML = data.ideas
        .map((idea) => {
          const topClass = idea.theme === 'saffron' ? 'saffron-top' : idea.theme === 'gold' ? 'gold-top' : '';
          return `<div class="biz-card">
            <div class="biz-card-top ${topClass}">
              <span class="biz-emoji">${idea.emoji}</span>
              <div class="biz-category">${escapeHtml(idea.category)}</div>
              <div class="biz-title">${escapeHtml(idea.title)}</div>
              <div class="biz-subtitle">${escapeHtml(idea.subtitle)}</div>
            </div>
            <div class="biz-card-body">
              <div class="biz-desc">${escapeHtml(idea.description)}</div>
              <ul class="biz-ideas-list">
                ${idea.ideas.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}
              </ul>
            </div>
          </div>`;
        })
        .join('');
    } catch (err) {
      grid.innerHTML = `<div class="empty-state">Couldn't load business ideas. ${escapeHtml(err.message)}</div>`;
    }
  },
};
