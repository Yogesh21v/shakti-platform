const Forum = {
  activeCategory: 'All Topics',

  async loadCategories() {
    const el = document.getElementById('forum-categories');
    try {
      const data = await apiFetch('/forum/categories');
      el.innerHTML = data.categories
        .map(
          (c) =>
            `<span class="cat-pill ${c === this.activeCategory ? 'active' : ''}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</span>`
        )
        .join('');
      el.querySelectorAll('.cat-pill').forEach((p) => {
        p.addEventListener('click', () => {
          el.querySelectorAll('.cat-pill').forEach((x) => x.classList.remove('active'));
          p.classList.add('active');
          this.activeCategory = p.dataset.cat;
          this.loadPosts();
        });
      });
    } catch (err) {
      el.innerHTML = '';
    }
  },

  async loadMentors() {
    const el = document.getElementById('mentors-list');
    try {
      const data = await apiFetch('/forum/mentors');
      el.innerHTML = data.mentors
        .map(
          (m) => `<div class="sc-member">
            <div class="sc-avatar" style="background:${m.avatarColor}">${escapeHtml(m.name.charAt(0))}</div>
            <div>
              <div class="sc-name">${escapeHtml(m.name)}</div>
              <div class="sc-role">${escapeHtml(m.role)}</div>
            </div>
          </div>`
        )
        .join('');
    } catch (err) {
      el.innerHTML = '';
    }
  },

  async loadPosts() {
    const list = document.getElementById('forum-thread-list');
    const district = document.getElementById('forum-district-filter')
      ? document.getElementById('forum-district-filter').value
      : '';
    const params = new URLSearchParams();
    if (this.activeCategory && this.activeCategory !== 'All Topics') params.set('category', this.activeCategory);
    if (district && district !== 'All Districts') params.set('district', district);

    try {
      const data = await apiFetch('/forum/posts?' + params.toString());
      this._lastPosts = data.posts;
      this.render(data.posts);
      this.renderTrending(data.posts);
    } catch (err) {
      list.innerHTML = `<div class="empty-state">Couldn't load discussions. ${escapeHtml(err.message)}</div>`;
    }
  },

  render(posts) {
    const list = document.getElementById('forum-thread-list');
    if (!posts.length) {
      list.innerHTML = '<div class="empty-state">No discussions in this category yet — be the first to post!</div>';
      return;
    }
    list.innerHTML = posts.map((p) => this.threadHtml(p)).join('');
  },

  threadHtml(p) {
    const tagClass = (i) => (i === 0 ? 'orange' : i === 1 ? 'gold' : '');
    return `<div class="forum-thread" data-post-id="${p.id}">
      <div class="thread-vote">
        <button class="vote-btn ${p.votedByMe ? 'voted' : ''}" style="${p.votedByMe ? 'color:var(--saffron);border-color:var(--saffron)' : ''}" onclick="Forum.vote('${p.id}', this)">▲</button>
        <span class="vote-count">${p.votes}</span>
      </div>
      <div class="thread-body">
        <div class="thread-title">${escapeHtml(p.title)}</div>
        <div class="thread-preview">${escapeHtml(p.body || '')}</div>
        <div class="thread-tags">
          ${p.tags.map((t, i) => `<span class="thread-tag ${tagClass(i)}">${escapeHtml(t)}</span>`).join('') || `<span class="thread-tag">${escapeHtml(p.category)}</span>`}
        </div>
        <div class="thread-meta">By <strong>${escapeHtml(p.authorName)}</strong> · ${p.repliesCount} replies · ${timeAgo(p.createdAt)}</div>

        <span class="thread-toggle-replies" onclick="Forum.toggleReplies('${p.id}')">
          ${p.repliesCount ? `View ${p.repliesCount} repl${p.repliesCount === 1 ? 'y' : 'ies'}` : 'Reply'}
        </span>
        <div class="reply-list" id="replies-${p.id}" style="display:none">
          ${p.replies.map((r) => `<div class="reply-item"><strong>${escapeHtml(r.authorName)}</strong> · ${timeAgo(r.createdAt)}<br>${escapeHtml(r.body)}</div>`).join('')}
          <div class="reply-form">
            <input type="text" id="reply-input-${p.id}" placeholder="Write a reply...">
            <button class="btn-primary" style="padding:8px 14px" onclick="Forum.submitReply('${p.id}')">Send</button>
          </div>
        </div>
      </div>
      <div class="thread-stats">
        <div>
          <div class="ts-replies">${p.repliesCount}</div>
          <div class="ts-label">replies</div>
        </div>
        ${p.pinned ? '<span class="ts-hot">📌 Pinned</span>' : ''}
      </div>
    </div>`;
  },

  toggleReplies(postId) {
    const el = document.getElementById('replies-' + postId);
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
  },

  async submitReply(postId) {
    if (!Session.isLoggedIn()) {
      showToast('Please log in to reply.');
      Auth.open('login');
      return;
    }
    const input = document.getElementById('reply-input-' + postId);
    const body = input.value.trim();
    if (!body) return;
    try {
      await apiFetch(`/forum/posts/${postId}/replies`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      });
      input.value = '';
      this.loadPosts();
    } catch (err) {
      showToast(err.message);
    }
  },

  async vote(postId, btn) {
    if (!Session.isLoggedIn()) {
      showToast('Please log in to vote.');
      Auth.open('login');
      return;
    }
    try {
      const data = await apiFetch(`/forum/posts/${postId}/vote`, { method: 'POST' });
      showToast(data.post.votedByMe ? 'Upvoted! 👍' : 'Vote removed.');
      this.loadPosts();
    } catch (err) {
      showToast(err.message);
    }
  },

  renderTrending(posts) {
    const el = document.getElementById('home-trending-list');
    if (!el) return;
    const top = [...posts].sort((a, b) => b.votes - a.votes).slice(0, 4);
    if (!top.length) {
      el.innerHTML = '<div class="empty-state">No discussions yet — start the first one!</div>';
      return;
    }
    const colors = ['#8B1A2B', '#1A6B7C', '#D4A017', '#E8660A'];
    el.innerHTML = top
      .map(
        (p, i) => `<div class="dp-item" onclick="showPage('forum')">
          <div class="dp-avatar" style="background:${colors[i % colors.length]}">${escapeHtml(p.authorName.charAt(0))}</div>
          <div class="dp-content">
            <div class="dp-post-title">${escapeHtml(p.title)}</div>
            <div class="dp-meta">By <span>${escapeHtml(p.authorName)}</span> · ${p.repliesCount} replies · ${timeAgo(p.createdAt)}</div>
          </div>
        </div>`
      )
      .join('');
  },

  openNewPostModal() {
    if (!Session.isLoggedIn()) {
      showToast('Please log in or join free to start a discussion.');
      Auth.open('login');
      return;
    }
    document.getElementById('modal').classList.add('open');
  },

  async submitPost() {
    const title = document.getElementById('post-title').value.trim();
    const body = document.getElementById('post-body').value.trim();
    const category = document.getElementById('post-category').value;
    const district = document.getElementById('post-district').value;

    if (!title) {
      showToast('Please enter a topic for your discussion.');
      return;
    }

    try {
      await apiFetch('/forum/posts', {
        method: 'POST',
        body: JSON.stringify({ title, body, category, district }),
      });
      closeModal();
      document.getElementById('post-title').value = '';
      document.getElementById('post-body').value = '';
      showToast('Your discussion has been posted! 🌸');
      this.loadPosts();
    } catch (err) {
      showToast(err.message);
    }
  },
};

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modal').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
  });
});
