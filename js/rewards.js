/* Rewards and Badges Module */
import { t, getCurrentLanguage } from './translations.js';
import {
  getProgressStore,
  saveProgressStore,
  ensureUserProgress,
  ensureUserExists,
  updateClassWithUser,
  queueForSync
} from './storage.js';

const $ = id => document.getElementById(id);

export function awardXP(username, amount) {
  ensureUserExists(username);
  ensureUserProgress(username);
  const s = getProgressStore();
  s[username].xp = (s[username].xp || 0) + amount;
  saveProgressStore(s);
  queueForSync({ type: 'award_xp', user: username, amount });
  window.dispatchEvent(new CustomEvent('uiUpdate'));
}

export function awardCoins(username, amount) {
  ensureUserExists(username);
  ensureUserProgress(username);
  const s = getProgressStore();
  s[username].coins = (s[username].coins || 0) + amount;
  saveProgressStore(s);
  queueForSync({ type: 'award_coins', user: username, amount });
  window.dispatchEvent(new CustomEvent('uiUpdate'));
}

export function addBadge(username, badge) {
  ensureUserProgress(username);
  const s = getProgressStore();
  const arr = s[username].badges || [];
  if (!arr.includes(badge)) {
    arr.push(badge);
    s[username].badges = arr;
    saveProgressStore(s);
    queueForSync({ type: 'badge', user: username, badge });
  }
}

export function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function generateSuggestions(percent, correct, total, subject) {
  const suggestions = [];
  const lang = getCurrentLanguage();

  if (percent === 100) {
    const tips = lang === 'te'
      ? ['మీ విజయ్ నుండి నేర్చుకోండి', 'ఈ కౌశల్యాలను ఉపయోగించండి', 'మరింత కష్ట విషయాలను సవాల్ చేయండి']
      : ['You\'ve mastered this!', 'Keep using these skills', 'Try harder challenges'];
    return tips;
  }

  if (percent >= 80) {
    const missed = total - correct;
    const tips = lang === 'te'
      ? [
        `${missed} సమస్య(లు) తప్పిపోయారు - చిన్న గ్రాముకు ప్రిన్నిపాలస్ పర్యవేక్షించండి`,
        'మీరు సరిగ్గా చేసిన విషయాలను పునరావృతం చేయండి',
        'ఎక్కువ సూక్ష్మమైన ప్రశ్నల కోసం సూక్ష్మమైన చదువుకోండి'
      ]
      : [
        `You missed ${missed} question(s). Review the tricky ones`,
        'The basics are solid - keep reinforcing them',
        'Focus on understanding, not just memorizing'
      ];
    return tips;
  }

  if (percent >= 50) {
    const tips = lang === 'te'
      ? [
        'ఈ విషయం కోసం చిన్న గేమ్ ఆడండి - మెమరీ విస్తుతుంది',
        'ప్రతిటీ విషయానికి మూల భావనలను నేర్చుకోండి',
        `${total - correct} లో ${total} సమస్యలు - ప్రతిదానిని భిన్నమైన దృష్టికోణం నుండి చేయండి`,
        'ఒక సరైన సమాధానం పొందిన ప్రతిది సరియైనదని అర్థం చేసుకోండి'
      ]
      : [
        'Play the mini game first - it helps memory!',
        'Learn the basic concepts behind each topic',
        `You got ${correct} out of ${total}. Review what you missed`,
        'Understand WHY answers are correct, not just memorize'
      ];
    return tips;
  }

  const tips = lang === 'te'
    ? [
      '📚 ప్రతిదీ మరలా చదువుకోండి - ఆధారాలు కన్నా ముఖ్యమైనది',
      '🎮 మీరు చేస్తున్న మిని గేమ్ - ఇది చాలా సహాయపడుతుంది!',
      '🔄 ఒక్క సమస్య ఒక్క సమయానికి నేర్చుకోండి - వేగంగా కాదు',
      `💪 దృష్టిశక్తిలో మీరు ${subject} కు మెరుపుకు ఉన్నారు - మీరు చేయగలరు!`
    ]
    : [
      '📚 Go back to basics - review the fundamentals',
      '🎮 Play the mini games first - they help a lot!',
      '🔄 Take it slow - learn one concept at a time',
      `💪 Don\'t give up on ${subject} - you can improve!`
    ];
  return tips;
}
