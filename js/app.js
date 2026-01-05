/* Main Application Initialization */
import { t, setLanguage, getCurrentLanguage } from './translations.js';
import { seedDefaults, showOfflineBadge, syncOutbox } from './storage.js';
import { initAuth, updateAllText, setCurrentUser, getCurrentUser } from './auth.js';
import { initChatbot, showChatbotSuggestions } from './chatbot.js';
import { initGame, initQuiz, closeModal } from './game.js';
import { initStudentUI } from './studentUI.js';
import { initTeacherUI } from './teacherUI.js';

const $ = id => document.getElementById(id);

export function initApp() {
  // Initialize seed data
  seedDefaults();

  // Initialize modules
  initAuth();
  initGame();
  initQuiz();
  initChatbot();
  initStudentUI();
  initTeacherUI();

  // Setup offline detection
  showOfflineBadge(!navigator.onLine);

  window.addEventListener('online', () => {
    showOfflineBadge(false);
    syncOutbox();
  });

  window.addEventListener('offline', () => {
    showOfflineBadge(true);
  });

  // Close modal button
  const btnClose = $('btnClose');
  if (btnClose) {
    btnClose.addEventListener('click', closeModal);
  }

  // Continue button in result modal
  $('continueBtn').addEventListener('click', () => {
    $('resultModal').classList.add('hidden');
  });

  // Attempt initial sync
  if (navigator.onLine) {
    setTimeout(syncOutbox, 600);
  }
}

// Start app on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Auto-call initApp
initApp();
