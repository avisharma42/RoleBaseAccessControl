const PRIMARY_API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

function getApiBases() {
  const bases = [PRIMARY_API_BASE, 'http://localhost:4000', 'http://127.0.0.1:4000'];
  return [...new Set(bases.filter(Boolean))];
}

export async function api(path, opts = {}) {
  // include saved token if present (fallback when cookies aren't sent across ports)
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const bases = getApiBases();
  let lastNetworkError = null;

  for (const base of bases) {
    try {
      const res = await fetch(`${base}/api${path}`, { credentials: 'include', headers, ...opts });
      if (!res.ok) {
        let payload = null;
        try { payload = await res.json(); } catch (e) { payload = null; }
        throw new Error(payload?.message || `Request failed (${res.status})`);
      }
      return res.json();
    } catch (err) {
      if (err?.message && !/Failed to fetch|NetworkError/i.test(err.message)) {
        throw err;
      }
      lastNetworkError = err;
    }
  }

  throw new Error(
    `Unable to reach API server. Start backend on port 4000 and allow origin ${window.location.origin}.`
  );
}
// Format date for post timestamps with relative time
export function formatDateTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  // Get relative time string
  let relativeTime;
  if (diffInSeconds < 60) {
    relativeTime = 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    relativeTime = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    relativeTime = `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    relativeTime = `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else {
    // For older posts, show full date
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    relativeTime = dateFormatter.format(date)
      .replace(',', ' —')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return relativeTime;
}

// --- Kudos helpers -------------------------------------------------
export async function giveKudo(postId) {
  return api(`/kudos`, { method: 'POST', body: JSON.stringify({ postId }) });
}

export async function getPostKudoCount(postId) {
  return api(`/kudos/post/${postId}/count`);
}

export async function getUserKudoCount(userId) {
  return api(`/kudos/user/${userId}/count`);
}

export async function getMonthlyLeaderboard() {
  return api(`/kudos/leaderboard/monthly`);
}

// --- Wellbeing helpers ----------------------------------------------
export async function submitWellbeingCheck(mood, journal) {
  return api(`/wellbeing`, {
    method: 'POST',
    body: JSON.stringify({ mood, journal })
  });
}

export async function getTodaysCheck() {
  return api(`/wellbeing/today`);
}

export async function getWellbeingMessages(mood) {
  return api(`/wellbeing/messages/${encodeURIComponent(mood)}`);
}

// --- Comments helpers -----------------------------------------------
export async function getPostComments(postId) {
  return api(`/comments/post/${postId}`);
}

export async function createComment(postId, content, parentId = null) {
  return api(`/comments`, {
    method: 'POST',
    body: JSON.stringify({ postId, content, parentId })
  });
}

export async function updateComment(commentId, content) {
  return api(`/comments/${commentId}`, {
    method: 'PATCH',
    body: JSON.stringify({ content })
  });
}

export async function deleteComment(commentId) {
  return api(`/comments/${commentId}`, {
    method: 'DELETE'
  });
}

export async function getCommentCount(postId) {
  return api(`/comments/post/${postId}/count`);
}

// --- Reactions helpers ----------------------------------------------
export async function toggleReaction(postId, type) {
  return api(`/posts/${postId}/react`, {
    method: 'PATCH',
    body: JSON.stringify({ type })
  });
}

// --- Bookmarks helpers ----------------------------------------------
export async function toggleBookmark(postId) {
  return api(`/bookmarks/${postId}`, {
    method: 'POST'
  });
}

export async function getBookmarks() {
  return api(`/bookmarks`);
}
