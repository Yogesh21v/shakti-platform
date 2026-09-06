const Legal = {
  async loadHelplines() {
    const el = document.getElementById('helplines-list');
    try {
      const data = await apiFetch('/legal/helplines');
      el.innerHTML = data.helplines
        .map(
          (h) => `<div class="helpline-item">
            <span class="hl-name">${escapeHtml(h.name)}</span>
            <span class="hl-num">${escapeHtml(h.number)}</span>
          </div>`
        )
        .join('');
    } catch (err) {
      el.innerHTML = '';
    }
  },

  async loadCategories() {
    const grid = document.getElementById('legal-categories-grid');
    try {
      const data = await apiFetch('/legal/categories');
      grid.innerHTML = data.categories
        .map((cat) => {
          const iconClass = cat.iconColor !== 'plain' ? cat.iconColor : '';
          return `<div class="legal-card">
            <div class="lc-header">
              <div class="lc-icon ${iconClass}">${cat.icon}</div>
              <div>
                <div class="lc-h">${escapeHtml(cat.title)}</div>
                <div class="lc-s">${escapeHtml(cat.subtitle)}</div>
              </div>
            </div>
            <div class="lc-body">
              ${cat.questions
                .map(
                  (q, i) => `<div class="legal-q" onclick="Legal.toggleAnswer('${cat._id}-${i}')">
                    ${escapeHtml(q.question)} <span class="legal-q-arrow">→</span>
                  </div>
                  <div class="legal-answer" id="legal-answer-${cat._id}-${i}">${escapeHtml(q.answer)}</div>`
                )
                .join('')}
            </div>
          </div>`;
        })
        .join('');
    } catch (err) {
      grid.innerHTML = `<div class="empty-state">Couldn't load legal resources. ${escapeHtml(err.message)}</div>`;
    }
  },

  toggleAnswer(key) {
    const el = document.getElementById('legal-answer-' + key);
    if (el) el.classList.toggle('open');
  },
};
