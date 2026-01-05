/* Local Storage and Data Management */

export function seedDefaults() {
  const existing = localStorage.getItem('ms_users');
  if (existing) return;
  const users = [
    { username: 'student', password: '1234', role: 'student', name: 'You' },
    { username: 'teacher', password: '1234', role: 'teacher', name: 'Teacher' }
  ];
  localStorage.setItem('ms_users', JSON.stringify(users));

  // class leaderboard sample
  const classData = [
    { id: 'u1', name: 'Asha', xp: 320, coins: 120, progress: { math: 80, science: 60, english: 50 } },
    { id: 'u2', name: 'Ravi', xp: 200, coins: 60, progress: { math: 50, science: 40, english: 35 } }
  ];
  localStorage.setItem('ms_class', JSON.stringify(classData));

  localStorage.setItem('ms_progress', JSON.stringify({})); // per-user progress
  localStorage.setItem('ms_outbox', JSON.stringify([])); // queue for sync
}

export function getProgressStore() {
  return JSON.parse(localStorage.getItem('ms_progress') || '{}');
}

export function saveProgressStore(obj) {
  localStorage.setItem('ms_progress', JSON.stringify(obj));
}

export function ensureUserProgress(username) {
  const s = getProgressStore();
  if (!s[username]) s[username] = { xp: 0, coins: 0, progress: { math: 0, science: 0, english: 0 }, badges: [] };
  saveProgressStore(s);
}

export function ensureUserExists(username) {
  const users = JSON.parse(localStorage.getItem('ms_users') || '[]');
  if (!users.find(u => u.username === username)) {
    users.push({ username, password: '', role: 'student', name: username });
    localStorage.setItem('ms_users', JSON.stringify(users));
  }
}

export function updateClassWithUser(username) {
  const classData = JSON.parse(localStorage.getItem('ms_class') || '[]');
  const s = getProgressStore();
  const userProg = s[username] || { xp: 0, coins: 0, progress: { math: 0, science: 0, english: 0 } };
  const idx = classData.findIndex(c => c.name === username);
  if (idx === -1) {
    classData.push({ id: username, name: username, xp: userProg.xp, coins: userProg.coins, progress: userProg.progress });
  } else {
    classData[idx].xp = userProg.xp;
    classData[idx].coins = userProg.coins;
    classData[idx].progress = userProg.progress;
  }
  localStorage.setItem('ms_class', JSON.stringify(classData));
  queueForSync({ type: 'class_update', user: username, payload: classData[idx], ts: new Date().toISOString() });
}

export function queueForSync(action) {
  const out = JSON.parse(localStorage.getItem('ms_outbox') || '[]');
  out.push({ ...action, ts: new Date().toISOString() });
  localStorage.setItem('ms_outbox', JSON.stringify(out));
}

export async function syncOutbox() {
  if (!navigator.onLine) return;
  const out = JSON.parse(localStorage.getItem('ms_outbox') || '[]');
  if (out.length === 0) return;
  console.log('Syncing', out.length, 'items...');
  try {
    await new Promise(r => setTimeout(r, 800));
    localStorage.setItem('ms_outbox', JSON.stringify([]));
    console.log('Sync success');
    return true;
  } catch (err) {
    console.warn('Sync failed', err);
    return false;
  }
}

export function showOfflineBadge(show) {
  const b = document.getElementById('offlineBadge');
  if (b) b.style.display = show ? 'block' : 'none';
}
