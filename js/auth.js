/* Authentication Module */
import { t, setLanguage, getCurrentLanguage } from './translations.js';
import { seedDefaults, getProgressStore, saveProgressStore, ensureUserProgress } from './storage.js';

let currentUser = null;

const $ = id => document.getElementById(id);

export function getCurrentUser() {
  return currentUser;
}

export function setCurrentUser(user) {
  currentUser = user;
  if (user) {
    localStorage.setItem('ms_current', JSON.stringify(user));
  } else {
    localStorage.removeItem('ms_current');
  }
}

export function initAuth() {
  // Initialize defaults
  seedDefaults();

  // Role buttons
  $('roleStudent').addEventListener('click', () => {
    $('username').value = 'student';
  });
  $('roleTeacher').addEventListener('click', () => {
    $('username').value = 'teacher';
  });
  $('btnDemo').addEventListener('click', () => {
    $('username').value = 'student';
    $('password').value = '1234';
  });

  // Language toggle
  $('languageToggle').addEventListener('change', (e) => {
    setLanguage(e.target.value);
    updateAllText();
  });

  // Login form
  $('loginForm').addEventListener('submit', handleLogin);

  // Logout button
  $('btnLogout').addEventListener('click', () => {
    localStorage.removeItem('ms_current');
    location.reload();
  });

  // Keyboard accessibility
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement === $('password')) {
      $('loginForm').dispatchEvent(new Event('submit', { cancelable: true }));
    }
  });

  // Check if already logged in
  checkExistingLogin();
}

function handleLogin(e) {
  e.preventDefault();
  const u = $('username').value.trim();
  const p = $('password').value.trim();
  const users = JSON.parse(localStorage.getItem('ms_users') || '[]');
  const found = users.find(x => x.username === u && x.password === p);
  if (!found) {
    alert(t('invalid_credentials'));
    return;
  }
  currentUser = { username: found.username, role: found.role, name: found.name || found.username };
  setCurrentUser(currentUser);

  // show nav and appropriate dashboard
  $('mainNav').classList.remove('hidden');
  $('loginScreen').classList.add('hidden');

  if (found.role === 'teacher') {
    $('teacherDash').classList.remove('hidden');
    $('studentDash').classList.add('hidden');
    $('chatbotBtn').style.display = 'none';
    // Dispatch custom event for teacher view
    window.dispatchEvent(new CustomEvent('renderTeacherView'));
  } else {
    $('studentDash').classList.remove('hidden');
    $('teacherDash').classList.add('hidden');
    $('chatbotBtn').style.display = 'flex';
    // Dispatch custom event for student view
    window.dispatchEvent(new CustomEvent('loadStudentView'));
  }
}

function checkExistingLogin() {
  const cur = JSON.parse(localStorage.getItem('ms_current') || 'null');
  $('languageToggle').value = getCurrentLanguage();
  updateAllText();

  if (cur) {
    currentUser = cur;
    $('mainNav').classList.remove('hidden');
    $('loginScreen').classList.add('hidden');
    if (cur.role === 'teacher') {
      $('teacherDash').classList.remove('hidden');
      $('chatbotBtn').style.display = 'none';
      window.dispatchEvent(new CustomEvent('renderTeacherView'));
    } else {
      $('studentDash').classList.remove('hidden');
      $('chatbotBtn').style.display = 'flex';
      window.dispatchEvent(new CustomEvent('loadStudentView'));
    }
  } else {
    $('mainNav').classList.add('hidden');
    $('chatbotBtn').style.display = 'none';
  }
}

export function updateAllText() {
  // Login screen
  if ($('loginTitle')) $('loginTitle').innerText = 'MindSprint — Rural Learning';
  if ($('loginSubtitle')) $('loginSubtitle').innerText = t('login_subtitle');
  if ($('roleStudent')) $('roleStudent').innerText = t('btn_student');
  if ($('roleTeacher')) $('roleTeacher').innerText = t('btn_teacher');

  const labels = document.querySelectorAll('label.small');
  if (labels[0]) labels[0].innerText = t('label_username');
  if (labels[1]) labels[1].innerText = t('label_password');

  const formBtns = $('loginForm').querySelectorAll('button');
  if (formBtns[0]) formBtns[0].innerText = t('btn_signin');
  if (formBtns[1]) formBtns[1].innerText = t('btn_demo');

  const demoP = $('loginForm').querySelector('p');
  if (demoP) {
    demoP.innerHTML = `<span>${t('demo_credentials')}</span><br><strong>${t('demo_student')}:</strong> student / 1234  |  <strong>${t('demo_teacher')}:</strong> teacher / 1234`;
  }

  // Student dashboard
  if ($('greeting')) $('greeting').innerText = t('greeting');
  const dashP = document.querySelector('#studentDash .card p');
  if (dashP && dashP.textContent.includes('Play a quick')) dashP.innerText = t('greeting_text');

  const xpLabel = document.querySelector('#xpDisplay')?.parentElement;
  if (xpLabel) {
    const labels = xpLabel.parentElement.querySelectorAll('div');
    if (labels[0] && labels[0].textContent.includes('XP')) labels[0].innerHTML = `${t('xp_label')} <strong id="xpDisplay">0</strong>`;
    if (labels[1] && labels[1].textContent.includes('Coins')) labels[1].innerHTML = `${t('coins_label')} <strong id="coinsDisplay">0</strong>`;
    if (labels[2] && labels[2].textContent.includes('Level')) labels[2].innerHTML = `${t('level_label')} <span id="levelDisplay" class="badge">1</span>`;
  }

  // Game elements
  if ($('gameTitle')) $('gameTitle').innerText = t('game_title');
  if ($('gameSubtitle')) $('gameSubtitle').innerText = t('game_subtitle');
  if ($('topicLabel')) $('topicLabel').innerText = t('topic_label');
  if ($('topicTip')) $('topicTip').innerText = t('topic_tip');

  if ($('startGameBtn')) $('startGameBtn').innerText = t('btn_start_game');
  if ($('skipGameBtn')) $('skipGameBtn').innerText = t('btn_skip_game');
  if ($('quizTitle')) $('quizTitle').innerText = t('quiz_title');
  if ($('quizIntro')) $('quizIntro').innerText = t('quiz_intro');
  if ($('startQuizBtn')) $('startQuizBtn').innerText = t('btn_start_quiz');

  // Progress labels
  if ($('mathLabel')) $('mathLabel').innerText = t('math_label');
  if ($('scienceLabel')) $('scienceLabel').innerText = t('science_label');
  if ($('englishLabel')) $('englishLabel').innerText = t('english_label');
  if ($('achievementsTitle')) $('achievementsTitle').innerText = t('achievements_title');

  // Achievement section titles
  if ($('mathAchTitle')) $('mathAchTitle').innerText = t('math_achievements');
  if ($('scienceAchTitle')) $('scienceAchTitle').innerText = t('science_achievements');
  if ($('englishAchTitle')) $('englishAchTitle').innerText = t('english_achievements');
  if ($('specialAchTitle')) $('specialAchTitle').innerText = t('special_achievements');

  // Quiz subject options
  if ($('optMath')) $('optMath').innerText = t('math_label');
  if ($('optScience')) $('optScience').innerText = t('science_label');
  if ($('optEnglish')) $('optEnglish').innerText = t('english_label');

  // Teacher dashboard
  if ($('teacherTitle')) $('teacherTitle').innerText = t('teacher_dashboard');
  if ($('teacherSubtitle')) $('teacherSubtitle').innerText = t('teacher_subtitle');
  if ($('leaderboardTitle')) $('leaderboardTitle').innerText = t('leaderboard_title');
  if ($('averagesTitle')) $('averagesTitle').innerText = t('subject_averages');

  // Buttons
  if ($('resetDataBtn')) $('resetDataBtn').innerText = t('btn_reset_data');
  if ($('exportBtn')) $('exportBtn').innerText = t('btn_export');
  if ($('btnClose')) $('btnClose').innerText = t('btn_close');
  if ($('continueBtn')) $('continueBtn').innerText = t('btn_continue');

  if ($('chatbotTitle')) $('chatbotTitle').innerText = t('ai_tutor', {}, 'AI Tutor');
}
