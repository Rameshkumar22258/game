/* Game Logic Module */
import { t, getCurrentLanguage } from './translations.js';
import { questionBank } from './questions.js';
import { getCurrentUser } from './auth.js';
import { awardXP, awardCoins, addBadge } from './rewards.js';
import { queueForSync } from './storage.js';

const $ = id => document.getElementById(id);
const GAME_STARS = 5;

let gameRunning = false;
let starsCollected = 0;
let quizState = null;

export function getGameState() {
  return { gameRunning, starsCollected, quizState };
}

export function clearGameArea() {
  const ga = document.querySelector('#gameArea');
  ga.innerHTML = '<div id="gameMsg" style="position:absolute;left:10px;top:10px;font-weight:700;color:#234">Stars: <span id="starsCollected">0</span>/5</div><div id="gameOverlay" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#999">Press "Start Game"</div>';
}

export function initGame() {
  $('startGameBtn').addEventListener('click', startGame);
  $('skipGameBtn').addEventListener('click', () => {
    startQuizFlow();
  });
  clearGameArea();
}

export function startGame() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert(t('login_first'));
    return;
  }
  gameRunning = true;
  starsCollected = 0;
  $('starsCollected').innerText = 0;
  const area = $('gameArea');
  area.innerHTML = '';

  const tip = document.createElement('div');
  tip.style.position = 'absolute';
  tip.style.left = '8px';
  tip.style.top = '8px';
  tip.style.fontWeight = '700';
  tip.innerText = t('stars_collected') + ': 0/' + GAME_STARS;
  area.appendChild(tip);

  for (let i = 0; i < GAME_STARS; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.style.position = 'absolute';
    s.style.fontSize = '22px';
    s.style.cursor = 'pointer';
    const x = Math.random() * 180 + 20;
    const y = Math.random() * 140 + 20;
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    s.style.transition = 'transform 0.12s';
    s.innerHTML = '⭐';
    s.addEventListener('click', (ev) => {
      if (!gameRunning) return;
      s.style.transform = 'scale(0.6)';
      s.style.opacity = '0.3';
      s.removeEventListener('click', null);
      starsCollected++;
      tip.innerText = t('stars_collected') + ': ' + starsCollected + '/' + GAME_STARS;
      $('starsCollected').innerText = starsCollected;
      if (starsCollected >= GAME_STARS) {
        endGame();
      }
    });
    area.appendChild(s);
  }
}

function endGame() {
  gameRunning = false;
  const currentUser = getCurrentUser();
  const rewardXP = 5 + (starsCollected * 2);
  const rewardCoins = 2 + Math.round(starsCollected / 2);
  awardXP(currentUser.username, rewardXP);
  awardCoins(currentUser.username, rewardCoins);
  queueForSync({
    type: 'game_play',
    user: currentUser.username,
    stars: starsCollected,
    xp: rewardXP,
    coins: rewardCoins
  });
  alert(t('game_complete', { stars: starsCollected, xp: rewardXP, coins: rewardCoins }));
  startQuizFlow();
}

export function initQuiz() {
  $('startQuizBtn').addEventListener('click', () => startQuizFlow());
}

export function startQuizFlow(subject) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert(t('login_first'));
    return;
  }
  const subj = subject || $('quizSubject').value;
  quizState = {
    subject: subj,
    index: 0,
    correct: 0,
    total: questionBank[subj].length,
    answers: []
  };
  openQuizModal();
  renderQuestion();
}

function openQuizModal() {
  $('quizModal').classList.remove('hidden');
}

export function closeModal() {
  $('quizModal').classList.add('hidden');
}

function renderQuestion() {
  const s = quizState;
  if (!s) return;
  const q = questionBank[s.subject][s.index];
  const questionText = getCurrentLanguage() === 'te' && q.q_te ? q.q_te : q.q;
  $('modalTitle').innerText = `${s.subject.toUpperCase()} — Q ${s.index + 1}/${s.total}`;
  $('modalQuestion').innerText = questionText;
  const opts = $('modalOptions');
  opts.innerHTML = '';
  q.options.forEach(opt => {
    const b = document.createElement('button');
    b.className = 'btn';
    b.style.marginTop = '6px';
    b.style.textAlign = 'left';
    b.innerText = opt;
    b.onclick = () => selectAnswer(opt);
    opts.appendChild(b);
  });
}

function selectAnswer(opt) {
  const s = quizState;
  const q = questionBank[s.subject][s.index];
  s.answers.push({ q: q.q, selected: opt, correct: q.ans });
  if (opt === q.ans) s.correct++;
  s.index++;
  if (s.index >= s.total) {
    closeModal();
    showQuizResult();
  } else {
    renderQuestion();
  }
}

export function showQuizResult() {
  const s = quizState;
  const percent = Math.round((s.correct / s.total) * 100);
  const xpGain = Math.round(s.correct * 12 + percent / 10);
  const coinsGain = Math.round(s.correct * 5 + percent / 25);

  // Update via event to handle in rewards module
  window.dispatchEvent(new CustomEvent('quizComplete', {
    detail: {
      username: getCurrentUser().username,
      subject: s.subject,
      percent,
      correct: s.correct,
      total: s.total,
      xpGain,
      coinsGain
    }
  }));

  quizState = null;
}

export function getQuizState() {
  return quizState;
}
