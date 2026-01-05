/* Chatbot Module */
import { t, getCurrentLanguage } from './translations.js';

const $ = id => document.getElementById(id);

export const chatbotKB = {
  en: [
    { keywords: ['hello', 'hi', 'hey', 'start'], response: 'Hello! 👋 I\'m your AI tutor. I can help you with Math, Science, or English questions. What would you like to learn about?' },
    { keywords: ['help', 'how', 'what can you do'], response: 'I can help you with:\n• Explaining math concepts\n• Science facts and topics\n• English grammar and vocabulary\n• Quiz tips and study strategies\n\nJust ask me anything!' },
    { keywords: ['fraction', 'math', 'divide', 'multiply'], response: 'Fractions are parts of a whole. For example, 1/2 means one part out of two equal parts (50%). To multiply fractions, multiply the top numbers and bottom numbers separately. Need more help?' },
    { keywords: ['science', 'oxygen', 'breathe', 'gas'], response: 'Oxygen is a gas that we breathe. It helps our body get energy. Plants produce oxygen during photosynthesis. All living things need oxygen to survive!' },
    { keywords: ['english', 'grammar', 'verb', 'noun'], response: 'In English:\n• Noun = a person, place, or thing (cat, school, happiness)\n• Verb = an action word (run, jump, eat)\n• Adjective = describes a noun (big, blue, happy)\nWant to learn more?' },
    { keywords: ['quiz', 'test', 'how to pass', 'study'], response: '📚 Tips for passing quizzes:\n1. Read the questions carefully\n2. Eliminate obviously wrong answers\n3. Review your weakest subjects\n4. Practice regularly with our mini games\n5. Don\'t rush - take your time!\n\nYou got this! 💪' },
    { keywords: ['xp', 'coins', 'points', 'reward'], response: '⭐ Earning rewards:\n• XP: Gained from games and quizzes\n• Coins: Earned by correct answers\n• Achievements: Unlock by perfect scores\n• Level up when you reach 100 XP!\n\nKeep learning to earn more!' },
    { keywords: ['achievement', 'badge', 'perfect'], response: '🏆 Achievements are unlocked by:\n• Perfect Score: Get 100% on a quiz\n• Excellent: Score 80% or higher\n• Master of All: Get 100% in all subjects\n\nWork hard to unlock them all!' },
    { keywords: ['thanks', 'thank you', 'appreciate'], response: 'You\'re welcome! 😊 Keep learning and improving. I\'m here whenever you need help. Good luck! 🌟' }
  ],
  te: [
    { keywords: ['hello', 'hi', 'hey', 'start'], response: 'హలో! 👋 నేను మీ AI టీచర్. నేను గణితం, విజ్ఞానం లేదా ఆంగ్లం గురించి సహాయం చేయగలను. మీరు ఏమి నేర్చుకోవాలనుకుంటున్నారు?' },
    { keywords: ['help', 'how', 'what can you do'], response: 'నేను సహాయం చేయగలను:\n• గణిత కలావధులను వివరించడం\n• విజ్ఞాన వాస్తవాలు\n• ఆంగ్ల వ్యాకరణ\n• పరీక్ష చిట్కాలు\n\nనన్ను ఏదైనా అడగండి!' },
    { keywords: ['fraction', 'math', 'divide', 'multiply'], response: 'భిన్నం అంటే మొత్తం యొక్క భాగం. ఉదాహరణకు, 1/2 అంటే రెండు భాగాలలో ఒక భాగం (50%). భిన్నాలను గుణించడానికి, పై సంఖ్యలను మరియు దిగువ సంఖ్యలను ఎక్కువ సహాయం కావాలా?' },
    { keywords: ['science', 'oxygen', 'breathe', 'gas'], response: 'ఆక్సిజన్ మనం శ్వాస తీసుకునే గ్యాస్. ఇది మన శరీరానికి శక్తిని సంపాదించడంలో సహాయం చేస్తుంది. మొక్కలు ఫోటోసింథిసిస్ సమయంలో ఆక్సిజన్‌ను ఉత్పత్తి చేస్తాయి.' },
    { keywords: ['english', 'grammar', 'verb', 'noun'], response: 'ఆంగ్లంలో:\n• నామం = ఒక వ్యక్తి, స్థలం, లేదా విషయం\n• క్రియ = చర్య పదం\n• విశేషణ = నామస్ కు వర్ణన\nమరిన్ని నేర్చుకోవాలా?' },
    { keywords: ['quiz', 'test', 'how to pass', 'study'], response: '📚 పరీక్షలో ఉత్తీర్ణత చేయడానికి చిట్కాలు:\n1. ప్రశ్నలను జాగ్రతగా చదవండి\n2. స్పష్టమైన తప్పు సమాధానాలను తీసివేయండి\n3. గట్టి విషయాలను సమీక్షించండి\n4. క్రమం తప్పకుండి సాధన చేయండి\n5. తాపజాడలుకు గతవేగం!\n\nమీరు చేయగలరు! 💪' },
    { keywords: ['xp', 'coins', 'points', 'reward'], response: '⭐ బహుమతులను సంపాదించడం:\n• XP: గేమ్‌ల నుండి లాభం\n• నాణేలు: సరైన సమాధానాల ద్వారా\n• సాధనలు: ఖచ్చితమైన స్కోర్‌ల ద్వారా\n• 100 XP వద్ద లెవల్ అప్!\n\nమరిన్ని సంపాదించుకోండి!' },
    { keywords: ['thanks', 'thank you', 'appreciate'], response: 'సంతోషం! 😊 నేర్చుకోవడం కొనసాగించండి. నేను ఎల్లప్పుడు ఉన్నాను. అదృష్టం! 🌟' }
  ]
};

let chatHistory = [];

export function initChatbot() {
  $('chatbotBtn').addEventListener('click', () => {
    const panel = $('chatbotPanel');
    const isHidden = panel.classList.contains('hidden');
    if (isHidden) {
      panel.classList.remove('hidden');
      $('chatbotInput').focus();
      if (chatHistory.length === 0) {
        addChatMessage('ai', t('chatbot_greeting', {}, 'Hello! 👋 I\'m your AI tutor. Ask me anything!'));
        showChatbotSuggestions();
      }
    } else {
      panel.classList.add('hidden');
    }
  });

  $('closeChatbotBtn').addEventListener('click', () => {
    $('chatbotPanel').classList.add('hidden');
  });

  $('chatbotSendBtn').addEventListener('click', sendChatMessage);
  $('chatbotInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });
}

export function addChatMessage(sender, text) {
  const msgEl = document.createElement('div');
  msgEl.className = sender === 'user' ? 'chatbot-message chatbot-user' : 'chatbot-message chatbot-ai';
  msgEl.innerHTML = text.replace(/\n/g, '<br>');
  $('chatbotMessages').appendChild(msgEl);
  $('chatbotMessages').scrollTop = $('chatbotMessages').scrollHeight;
  chatHistory.push({ sender, text });
}

export function sendChatMessage() {
  const input = $('chatbotInput');
  const message = input.value.trim();
  if (!message) return;

  input.value = '';
  addChatMessage('user', message);

  // Find matching response
  const kb = chatbotKB[getCurrentLanguage()] || chatbotKB['en'];
  let response = null;
  const msgLower = message.toLowerCase();

  for (const qa of kb) {
    for (const kw of qa.keywords) {
      if (msgLower.includes(kw.toLowerCase())) {
        response = qa.response;
        break;
      }
    }
    if (response) break;
  }

  if (!response) {
    response = getCurrentLanguage() === 'te'
      ? 'క్షమించండి, నేను ఆ ప్రశ్నను అర్థం చేసుకోలేదు. కొంచెం విభిన్నంగా అడగండి! 😊'
      : 'Sorry, I didn\'t understand that question. Try asking differently! 😊';
  }

  setTimeout(() => {
    addChatMessage('ai', response);
    showChatbotSuggestions();
  }, 300);
}

export function showChatbotSuggestions() {
  const sugDiv = $('chatbotSuggestions');
  sugDiv.innerHTML = '';

  const suggestions = getCurrentLanguage() === 'te'
    ? ['గణితం గురించి', 'విజ్ఞానం గురించి', 'సహాయం కావాలా', 'సాధనల గురించి']
    : ['Tell me about Math', 'Tell me about Science', 'How to pass quiz', 'About rewards'];

  suggestions.forEach(sug => {
    const btn = document.createElement('div');
    btn.className = 'chatbot-suggestion';
    btn.innerText = sug;
    btn.onclick = () => {
      $('chatbotInput').value = sug;
      sendChatMessage();
    };
    sugDiv.appendChild(btn);
  });
}
