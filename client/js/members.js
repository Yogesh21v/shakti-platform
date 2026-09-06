const Members = {
  async load() {
    const grid = document.getElementById('members-grid');
    const search = document.getElementById('members-search-input').value;
    const district = document.getElementById('members-district-filter').value;
    const skill = document.getElementById('members-skill-filter').value;

    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (district) params.set('district', district);
    if (skill) params.set('skill', skill);

    try {
      const data = await apiFetch('/members?' + params.toString());
      this.render(data.members);
    } catch (err) {
      grid.innerHTML = `<div class="empty-state">Couldn't load members. ${escapeHtml(err.message)}</div>`;
    }
  },

  render(list) {
    const grid = document.getElementById('members-grid');
    if (!list.length) {
      grid.innerHTML = '<div class="empty-state">No members match that search yet.</div>';
      return;
    }
    grid.innerHTML = list
      .map((m) => {
        const skillClass = (s) => (s === 'Digital & Online' ? 'biz' : s.includes('Craft') || s.includes('Textile') ? 'craft' : '');
        return `<div class="member-card">
          <div class="member-avatar" style="background:${m.avatarColor}">
            ${m.avatarInitial}
            ${m.online ? '<div class="online-dot"></div>' : ''}
          </div>
          <div class="member-name">${escapeHtml(m.name)}</div>
          <div class="member-loc">📍 ${escapeHtml(m.district || 'Location not set')}</div>
          <div class="member-skills">
            ${m.skills.map((s) => `<span class="skill-tag ${skillClass(s)}">${escapeHtml(s)}</span>`).join('')}
          </div>
          <button class="member-connect" onclick="showToast('Connection request sent to ${escapeHtml(m.name)}! 🤝')">Connect</button>
        </div>`;
      })
      .join('');
  },
};
