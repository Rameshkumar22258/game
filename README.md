<<<<<<< HEAD
# MindSprint - Modular Structure

## Project Overview
MindSprint is a rural gamified learning platform (offline-first) that has been refactored into a modular, maintainable architecture separating CSS, JavaScript functionality, and HTML structure.

## Directory Structure

```
GAMES/
├── index.html                 # Main HTML file (entry point)
├── css/
│   └── styles.css             # All styling (removed from HTML)
└── js/
    ├── app.js                 # Main application initialization
    ├── auth.js                # Authentication & login logic
    ├── chatbot.js             # AI chatbot functionality
    ├── game.js                # Game & quiz logic
    ├── questions.js           # Question banks for quizzes
    ├── rewards.js             # Rewards & badge system
    ├── storage.js             # LocalStorage & data management
    ├── studentUI.js           # Student dashboard UI
    ├── teacherUI.js           # Teacher dashboard UI
    └── translations.js        # Language support (EN & TE)
```

## Module Descriptions

### Core Modules

**auth.js**
- User authentication (login/logout)
- Role-based access (Student/Teacher)
- Language selection and text updates
- Session persistence

**storage.js**
- LocalStorage management
- Progress tracking per user
- Class leaderboard data
- Sync queue for offline-first functionality
- Offline/online detection

**translations.js**
- Bilingual support (English & Telugu)
- Translation helper function `t(key, replacements)`
- Language persistence

### Feature Modules

**game.js**
- Star collection mini-game logic
- Quiz flow management
- Modal interactions
- Game state management

**questions.js**
- Quiz question banks for Math, Science, English
- Bilingual questions
- Structured question objects

**chatbot.js**
- AI tutor knowledge base
- Chat message handling
- Suggestion system
- Multi-language responses

**rewards.js**
- XP and coins system
- Badge/achievement management
- Performance suggestions
- Score categorization

### UI Modules

**studentUI.js**
- Student dashboard rendering
- Progress bars and stats
- Achievement display
- Quiz result handling
- Personalized feedback

**teacherUI.js**
- Teacher dashboard rendering
- Class leaderboard
- Subject averages chart (Chart.js)
- Data reset and CSV export

### Styling

**styles.css**
- Complete design system (CSS variables)
- Responsive layouts
- Component styles
- Animation definitions
- Media queries

## Dependencies

### External Libraries
- **Font Awesome 6.4.0** - Icons
- **Chart.js** - Bar charts for teacher dashboard

### Browser APIs Used
- **localStorage** - Data persistence
- **sessionStorage** - Session management
- **DOM API** - UI manipulation
- **EventTarget** - Custom events for module communication

## Module Communication

Modules communicate via:
1. **Custom Events** - Decoupled pub/sub pattern
   - `loadStudentView` - Load student dashboard
   - `renderTeacherView` - Load teacher dashboard
   - `uiUpdate` - Update all UI elements
   - `quizComplete` - Quiz completion handler
   - `seedDefaults` - Initialize default data

2. **Import/Export** - Direct module dependencies
   - Each module explicitly imports needed functions

3. **Global DOM Elements** - Using `$` helper for element access

## Key Features

✅ **Offline-First** - Works without internet, syncs when online
✅ **Bilingual** - English & Telugu translations
✅ **Gamification** - XP, coins, badges, levels
✅ **Role-Based** - Student and Teacher dashboards
✅ **Responsive** - Mobile-friendly design
✅ **Data Persistence** - All data stored locally
✅ **AI Chatbot** - Intelligent tutor assistant
✅ **Progress Tracking** - Subject-wise performance

## Migration Notes

### From Single File to Modular
- Original monolithic HTML (1409 lines) split into 14 modules
- All CSS extracted to external stylesheet
- JavaScript organized by feature/responsibility
- No breaking changes to functionality
- All dependencies preserved

### How to Use
1. Open `index.html` in a modern browser
2. Use demo credentials: `student`/`1234` or `teacher`/`1234`
3. All data automatically stored in browser's localStorage
4. Works offline - changes sync when back online

## Development Guidelines

### Adding New Features
1. Create new module in `/js/` folder
2. Use ES6 modules (import/export)
3. Export only public functions
4. Use custom events for module communication
5. Update `app.js` initialization if needed

### Modifying Existing Modules
- Keep modules focused on single responsibility
- Update imports/exports as needed
- Test all dependent modules
- Use `queueForSync()` for data changes

### CSS Updates
- Add styles to `css/styles.css`
- Use CSS variables from `:root`
- Follow mobile-first responsive approach

## Performance Optimizations
- Module code splitting via ES6
- Lazy initialization of components
- Event delegation for dynamic elements
- LocalStorage caching for offline access
- Efficient DOM queries with `$()` helper

## Browser Support
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support (iOS Safari, Chrome Mobile)

## Future Enhancements
- Add backend API integration
- Implement real sync with server
- Add more languages
- Expand question banks
- Advanced analytics dashboard
- Parent notification system
=======
# game
>>>>>>> c22270dfa90c0a8d19e682bc992d696533514e89
