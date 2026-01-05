/* Teacher UI Module */
import { getCurrentUser } from './auth.js';
import { getProgressStore } from './storage.js';
import { t } from './translations.js';

const $ = id => document.getElementById(id);

let teacherChart = null;

export function initTeacherUI() {
  window.addEventListener('renderTeacherView', () => {
    renderTeacherView();
  });

  // Reset data button
  $('resetDataBtn').addEventListener('click', () => {
    if (!confirm(t('confirm_reset'))) return;
    localStorage.removeItem('ms_progress');
    localStorage.removeItem('ms_class');
    localStorage.removeItem('ms_outbox');
    // Re-seed defaults
    const event = new CustomEvent('seedDefaults');
    window.dispatchEvent(event);
    alert(t('reset_success'));
    location.reload();
  });

  // Export CSV button
  $('exportBtn').addEventListener('click', () => {
    const prog = JSON.parse(localStorage.getItem('ms_progress') || '{}');
    let csv = 'username,xp,coins,math,science,english\n';
    for (const u in prog) {
      const p = prog[u];
      csv += `${u},${p.xp || 0},${p.coins || 0},${p.progress?.math || 0},${p.progress?.science || 0},${p.progress?.english || 0}\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'class_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  });

  window.addEventListener('uiUpdate', () => {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.role === 'teacher') {
      renderTeacherView();
    }
  });
}

export function renderTeacherView() {
  const classData = JSON.parse(localStorage.getItem('ms_class') || '[]');
  const container = $('leaderboardContainer');
  container.innerHTML = '';

  classData.sort((a, b) => (b.xp || 0) - (a.xp || 0));
  classData.forEach((c, idx) => {
    const row = document.createElement('div');
    row.className = 'leaderboard-row';
    row.innerHTML = `<div style="display:flex;gap:12px;align-items:center"><div style="width:36px;height:36px;border-radius:50%;background:#f6f7ff;display:flex;align-items:center;justify-content:center">${idx + 1}</div>
                     <div><b>${c.name}</b><div class="muted">XP ${c.xp} • ${c.coins} coins</div></div></div>
                     <div style="text-align:right"><div style="font-weight:700">${Math.round(((c.progress.math || 0) + (c.progress.science || 0) + (c.progress.english || 0)) / 3)}%</div><div class="muted">Avg</div></div>`;
    container.appendChild(row);
  });

  const avgMath = Math.round(classData.reduce((s, c) => s + (c.progress.math || 0), 0) / Math.max(1, classData.length));
  const avgSci = Math.round(classData.reduce((s, c) => s + (c.progress.science || 0), 0) / Math.max(1, classData.length));
  const avgEng = Math.round(classData.reduce((s, c) => s + (c.progress.english || 0), 0) / Math.max(1, classData.length));

  const ctx = $('teacherChart').getContext('2d');
  if (teacherChart) teacherChart.destroy();

  // Using Chart.js from CDN
  if (typeof Chart !== 'undefined') {
    teacherChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Math', 'Science', 'English'],
        datasets: [{
          label: 'Avg %',
          data: [avgMath, avgSci, avgEng],
          backgroundColor: ['#6C63FF', '#05CD99', '#FF6584']
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }
}

export function refreshClassData() {
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.role === 'teacher') {
    renderTeacherView();
  }
}
