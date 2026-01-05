/* Student UI Module */
import { t } from './translations.js';
import { getCurrentUser } from './auth.js';
import { getProgressStore, saveProgressStore, updateClassWithUser } from './storage.js';
import { awardXP, awardCoins, addBadge, capitalize, generateSuggestions } from './rewards.js';
import { queueForSync, syncOutbox } from './storage.js';

const $ = id => document.getElementById(id);

export function initStudentUI() {
  window.addEventListener('loadStudentView', () => {
    loadStudentView();
  });

  window.addEventListener('uiUpdate', () => {
    updateStudentUI();
  });

  window.addEventListener('quizComplete', (e) => {
    handleQuizComplete(e.detail);
  });
}

function loadStudentView() {
  const cu = getCurrentUser();
  if (cu) {
    updateStudentUI();
    updateClassWithUser(cu.username);
  }
}

function updateStudentUI() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const store = getProgressStore();
  const u = store[currentUser.username] || { xp: 0, coins: 0, progress: { math: 0, science: 0, english: 0 }, badges: [] };

  $('xpDisplay').innerText = u.xp || 0;
  $('coinsDisplay').innerText = u.coins || 0;
  const lvl = Math.floor((u.xp || 0) / 100) + 1;
  $('levelDisplay').innerText = lvl;
  $('navCoins').innerText = u.coins || 0;
  $('navLevel').innerText = lvl;

  const m = u.progress.math || 0;
  const s = u.progress.science || 0;
  const e = u.progress.english || 0;
  $('progMath').style.width = Math.max(0, m) + '%';
  $('progScience').style.width = Math.max(0, s) + '%';
  $('progEnglish').style.width = Math.max(0, e) + '%';
  $('scoreMath').innerText = Math.max(0, m) + '%';
  $('scoreScience').innerText = Math.max(0, s) + '%';
  $('scoreEnglish').innerText = Math.max(0, e) + '%';

  const badges = u.badges || [];
  const mathBadges = badges.filter(b => b.includes('Math'));
  const scienceBadges = badges.filter(b => b.includes('Science'));
  const englishBadges = badges.filter(b => b.includes('English'));
  const specialBadges = badges.filter(b => !b.includes('Math') && !b.includes('Science') && !b.includes('English'));

  renderAchievementCategory('achievementsListMath', mathBadges, 'math');
  renderAchievementCategory('achievementsListScience', scienceBadges, 'science');
  renderAchievementCategory('achievementsListEnglish', englishBadges, 'english');
  renderAchievementCategory('achievementsListSpecial', specialBadges, 'special');
}

function renderAchievementCategory(containerId, badges, category) {
  const container = $(containerId);
  container.innerHTML = '';

  if (badges.length === 0) {
    const empty = document.createElement('div');
    empty.style.color = '#999';
    empty.style.fontSize = '0.9rem';
    empty.innerText = t('no_achievements_yet');
    container.appendChild(empty);
    return;
  }

  const categoryColors = {
    math: { bg: '#eef2ff', border: 'var(--primary)', icon: '🔢' },
    science: { bg: '#eef9f6', border: 'var(--success)', icon: '🔬' },
    english: { bg: '#ffe8f0', border: 'var(--accent)', icon: '📚' },
    special: { bg: '#fff5e8', border: '#FF9800', icon: '⭐' }
  };

  const colors = categoryColors[category] || categoryColors.special;

  badges.forEach(badge => {
    const el = document.createElement('div');
    el.style.padding = '10px';
    el.style.border = `2px solid ${colors.border}`;
    el.style.background = colors.bg;
    el.style.borderRadius = '8px';
    el.style.textAlign = 'center';
    el.style.cursor = 'pointer';
    el.style.transition = 'transform 0.2s, box-shadow 0.2s';
    el.style.fontSize = '0.85rem';
    el.style.fontWeight = '600';
    el.innerHTML = `<div style="font-size:24px;margin-bottom:4px">${colors.icon}</div><div style="word-wrap:break-word">${badge}</div>`;

    el.addEventListener('mouseover', () => {
      el.style.transform = 'translateY(-4px)';
      el.style.boxShadow = '0 6px 12px rgba(0,0,0,0.1)';
    });
    el.addEventListener('mouseout', () => {
      el.style.transform = 'translateY(0)';
      el.style.boxShadow = 'none';
    });

    container.appendChild(el);
  });
}

function handleQuizComplete(detail) {
  const { username, subject, percent, correct, total, xpGain, coinsGain } = detail;

  awardXP(username, xpGain);
  awardCoins(username, coinsGain);

  const store = getProgressStore();
  const user = store[username];
  const prev = user.progress[subject] || 0;
  if (percent > prev) user.progress[subject] = percent;

  let perfectScoreBonus = 0;
  if (percent === 100) {
    addBadge(username, `Perfect ${capitalize(subject)}`);
    perfectScoreBonus = 50;
    awardXP(username, perfectScoreBonus);
    awardCoins(username, 10);

    const math = user.progress.math || 0;
    const science = user.progress.science || 0;
    const english = user.progress.english || 0;
    if (math === 100 && science === 100 && english === 100) {
      addBadge(username, 'Master of All');
    }
  } else if (percent >= 80) {
    addBadge(username, `Excellent ${capitalize(subject)}`);
  }

  store[username] = user;
  saveProgressStore(store);
  updateClassWithUser(username);
  queueForSync({
    type: 'quiz_result',
    user: username,
    subject: subject,
    score: percent,
    xp: xpGain,
    coins: coinsGain,
    perfect: percent === 100
  });

  $('resultTitle').innerText = t('quiz_score', { percent, correct, total });
  const body = $('resultBody');
  body.innerHTML = '';

  let bonusText = '';
  if (percent === 100) {
    bonusText = `<div style="background:#fff5e8;border:2px solid #FF9800;padding:12px;border-radius:8px;margin-bottom:12px;text-align:center">
                   <div style="font-size:1.2rem;font-weight:800;color:#FF9800">🎉 PERFECT SCORE! 🎉</div>
                   <div style="color:#666;font-size:0.9rem;margin-top:4px">+${perfectScoreBonus} Bonus XP • +10 Bonus Coins</div>
                 </div>`;
  }

  const p1 = document.createElement('p');
  p1.innerHTML = bonusText + `<strong>XP +${xpGain + (percent === 100 ? perfectScoreBonus : 0)}</strong> • <strong>${t('coins_label')} +${coinsGain + (percent === 100 ? 10 : 0)}</strong>`;
  body.appendChild(p1);

  const msg = document.createElement('p');
  if (percent === 100) msg.innerText = '🌟 ' + t('perfect_score');
  else if (percent >= 80) msg.innerText = t('amazing');
  else if (percent >= 50) msg.innerText = t('good_effort');
  else msg.innerText = t('try_better');
  body.appendChild(msg);

  const suggestionsDiv = document.createElement('div');
  suggestionsDiv.style.marginTop = '16px';
  suggestionsDiv.style.padding = '12px';
  suggestionsDiv.style.background = '#f9f9f9';
  suggestionsDiv.style.borderRadius = '8px';
  suggestionsDiv.style.borderLeft = '4px solid var(--primary)';

  const suggestions = generateSuggestions(percent, correct, total, subject);
  const sugTitle = document.createElement('strong');
  sugTitle.style.display = 'block';
  sugTitle.style.marginBottom = '8px';
  sugTitle.style.color = 'var(--primary)';
  sugTitle.innerText = '💡 Tips to Improve:';
  suggestionsDiv.appendChild(sugTitle);

  suggestions.forEach(sug => {
    const suggEl = document.createElement('div');
    suggEl.style.margin = '6px 0';
    suggEl.style.fontSize = '0.9rem';
    suggEl.style.color = '#555';
    suggEl.innerHTML = `• ${sug}`;
    suggestionsDiv.appendChild(suggEl);
  });

  body.appendChild(suggestionsDiv);

  const badgeDiv = document.createElement('div');
  badgeDiv.style.marginTop = '8px';
  const us = getProgressStore()[username];
  const badgeList = us.badges || [];
  if (badgeList.length) {
    badgeDiv.innerHTML = `<div class="muted" style="margin-top:12px;margin-bottom:8px"><strong>${t('your_badges')}:</strong></div>` + badgeList.map(b => `<span style="display:inline-block;background:#fff;padding:8px 12px;border-radius:8px;margin:4px;border:2px solid var(--primary);font-weight:600;font-size:0.9rem">✓ ${b}</span>`).join('');
    body.appendChild(badgeDiv);
  }
  $('resultModal').classList.remove('hidden');

  updateStudentUI();
}
