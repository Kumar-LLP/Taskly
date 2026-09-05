# 📝 Taskly — Study & Activity Organizer

> A modern, lightweight, and offline-first personal productivity web application designed for students and learners to organize academic tasks, manage focus sessions with Pomodoro timing, log daily habits, and visualize progress.

---

## ✨ Features

### 🍅 Dual-Mode Focus Timer (Pomodoro & Stopwatch)
- **High-Precision Delta Timing**: Uses `Date.now()` timestamp deltas to ensure 100% timekeeping accuracy even when browser tabs are throttled in the background.
- **Customizable Pomodoro Presets**: One-click deep focus presets (`25m Focus`, `5m Break`, `15m Rest`, `50m Deep`) plus custom duration input (`⚙️ Custom`) between 1 and 180 minutes.
- **Multi-Tone Synthesizer**: 4 offline audio sound profiles generated via the **Web Audio API** (🎵 Melodic Chime, 🧘 Zen Bell, ⏰ Digital Beep, 🌴 Upbeat Marimba) with sound previewing.
- **Stopwatch Mode**: Track real-time study and activity duration continuously.
- **Live Tab Sync**: Synchronizes current session time and countdown directly in your browser's tab title (e.g. `(🍅 24:12) Taskly`).
- **Unload Protection**: Automatically persists timer progress to `localStorage` even if the browser window is unexpectedly closed or refreshed.

### ☑️ Interactive Subtasks & Milestone Checklists
- **Breakdown Tasks**: Add detailed milestone checklists to any task card to tackle large goals step by step.
- **Dynamic Auto-Tracking**: Checking off subtasks automatically recalculates task progress and triggers celebration confetti when all milestones are accomplished.
- **Inline Rapid Entry**: Quickly type new subtasks directly on task cards without opening an edit modal.

### ⌨️ Global Keyboard Shortcuts
- **`Space`**: Quickly toggle Start / Pause on the active timer session from anywhere.
- **`Ctrl + K` / `Cmd + K` or `/`**: Instantly jump to and focus the search and filter input.
- **`Esc`**: Close any active modal dialog or backdrop.
- **`?`**: Pop up the built-in keyboard shortcuts reference card.

### 📱 Progressive Web App (PWA) & Offline Engine
- **Installable**: Install Taskly as a native standalone app on Windows, macOS, Android, and iOS.
- **Service Worker (`sw.js`)**: Caches essential HTML, CSS, JavaScript, and SVG assets for dependable offline-first reliability.
- **Web App Manifest (`manifest.json`)**: Configured with standalone display, dark theme colors, and vector icon branding.
- **Automated GitHub Actions Deployment**: Includes `.github/workflows/deploy.yml` for instant, zero-config publishing to GitHub Pages on push.

### ⚡ Smart Task Management & Quick Progress Logging
- **Instant `[+]` / `[-]` Progress**: Click buttons on task cards to quickly increment completed exercises, chapters, or units without opening an edit modal.
- **Auto Completion**: Tasks automatically check off with a celebratory confetti particle effect when goals are met, logging an exact completion timestamp.
- **Priority & Due Dates**:
  - Priority levels: 🔥 **High**, ⚡ **Medium**, 🟢 **Low**.
  - Dynamic deadline badges: **⚠️ Overdue**, **⏰ Due Today**, or **📅 Upcoming**.
- **Task Editing**: Full modal to update task titles, subjects, priorities, deadlines, and quantities on the fly.
- **Sports & Hobbies Quick-Select**: One-click chip presets for Cricket, Football, Basketball, Badminton, Running, and Gym workouts.

### 🔍 Search, Filtering & Sorting
- **Instant Search**: Real-time search by task name, subject, or category.
- **Category Filters**: Filter by `Study`, `Sports`, `Fitness`, `Personal`, or `All`.
- **Status Filters**: View `All`, `Active`, or `Completed` tasks.
- **Sorting Options**: Sort by Newest Added, Priority (High → Low), Due Date (Earliest First), Most Time Spent, or Alphabetical (A-Z).

### 📈 Visual Analytics & Habit Streaks
- **HTML5 Canvas Weekly Focus Chart**: Lightweight, responsive bar chart visualizing study time in minutes over the last 7 days.
- **Consistency Streak Tracker**: Tracks consecutive active study days (`🔥 X Days`) to build daily momentum based on logged focus time and task completions.
- **Live Stats Dashboard**: Instant overview of Total Tasks, Completed, Remaining, and Total Study Hours logged.

### 🌙 Modern UI & Dark Mode
- **Theme Switcher**: Smooth toggle between Light Mode and Dark Mode (🌙 / ☀️), with theme preferences automatically saved.
- **Responsive Layout**: Optimized for desktop, tablets, and mobile screens.

### 💾 Private Offline Storage, Backup & Restore
- **Zero Cloud Dependence**: All data resides safely in your browser's `localStorage`.
- **JSON Backup**: Download full data backups and restore them on any device.
- **CSV Export**: Export your tasks and time tracking directly into a spreadsheet-ready `.csv` file with UTF-8 BOM encoding for Microsoft Excel.

---

## 📂 Project Structure

```text
PROJECT 1'/
│
├── index.html                  # Main application markup & layout
├── style.css                   # Modern CSS variables, light/dark themes, responsive layout
├── app.js                      # Core application logic (Timer, Tasks, Analytics, Backup)
├── manifest.json               # Progressive Web App manifest
├── sw.js                       # Service Worker for offline asset caching
├── icon.svg                    # Vector app icon & favicon
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

Taskly is completely serverless and requires **no installation, Node.js, or build steps**.

1. Double-click [`index.html`](file:///C:/Users/LOQ/Downloads/PROJECT/PROJECT%201'/index.html) or right-click and choose **Open with** your preferred web browser (Chrome, Edge, Firefox, Safari, Brave, etc.).
2. That's it! Your tasks and timer logs will automatically persist between visits.

---

## 🛠️ Technology Stack

- **HTML5**: Semantic elements, accessible dialogs, and Canvas graphics.
- **CSS3**: CSS Custom Properties (Variables), Flexbox, CSS Grid, Glassmorphism, and responsive media queries.
- **JavaScript (ES6+)**: Modular client-side architecture.
- **Web Audio API**: Real-time frequency synthesis for timer alerts (works 100% offline).
- **Web Storage API**: `localStorage` for privacy-first, zero-login persistence.
- **Canvas 2D API**: Crisp rendering for weekly analytics charts and celebratory confetti particles.

---

## 📞 Support & Feedback

Have suggestions or feedback?
- **Email**: [peek.exc@gmail.com](mailto:peek.exc@gmail.com)
- **Phone**: [+977 9744363847](tel:+9779744363847)

---

*© 2026 Taskly. Built for focused minds.*
