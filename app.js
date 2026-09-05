/* ==========================================================================
   TASKLY - JAVASCRIPT APPLICATION CORE
   Modular Logic: Tasks CRUD, Pomodoro & Stopwatch, Analytics Canvas,
   Search & Filters, Due Dates & Priority, Confetti & Audio Chimes, Data Backup
   ========================================================================== */

// --- INITIAL STATE & DATA STORAGE ---
const STORAGE_KEYS = {
    TASKS: "tasklyTasks",
    THEME: "tasklyTheme",
    DAILY_STATS: "tasklyDailyStats",
    SOUND: "tasklySoundEnabled"
};

// Default sample tasks for new users
const DEFAULT_TASKS = [
    {
        id: 1710000001,
        title: "Mathematics Calculus Problem Set",
        category: "Study",
        subject: "Derivatives & Integrals",
        priority: "high",
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        totalWork: 10,
        completedWork: 6,
        completed: false,
        actualSeconds: 2720,
        createdAt: new Date().toISOString()
    },
    {
        id: 1710000002,
        title: "Physics Mechanics Numerical Practice",
        category: "Study",
        subject: "Kinematics & Dynamics",
        priority: "medium",
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        totalWork: 8,
        completedWork: 8,
        completed: true,
        actualSeconds: 4200,
        createdAt: new Date().toISOString()
    },
    {
        id: 1710000003,
        title: "Evening 5K Run & Stretching",
        category: "Fitness",
        subject: "Cardio",
        priority: "low",
        dueDate: new Date().toISOString().split('T')[0], // Today
        totalWork: 5,
        completedWork: 3,
        completed: false,
        actualSeconds: 1500,
        createdAt: new Date().toISOString()
    }
];

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS)) || DEFAULT_TASKS;
let dailyStats = JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_STATS)) || {};

// Timer State
let activeTask = null;
let timerInterval = null;
let timerLastTimestamp = null;
let timerMode = "stopwatch"; // "stopwatch" | "pomodoro"
let pomodoroDuration = 25 * 60; // default 25 mins
let pomodoroRemaining = 25 * 60;
let isTimerRunning = false;
let soundEnabled = localStorage.getItem(STORAGE_KEYS.SOUND) !== "false";

// Filter & Search State
let currentCategoryFilter = "All";
let currentStatusFilter = "all";
let currentSearchQuery = "";
let currentSort = "newest";

// ==========================================================================
// 1. NAVIGATION & THEME MANAGEMENT
// ==========================================================================

function switchTab(viewName) {
    const homeView = document.getElementById("home-view");
    const dashboardView = document.getElementById("dashboard-view");
    const navHome = document.getElementById("nav-home");
    const navDashboard = document.getElementById("nav-dashboard");

    if (viewName === "home") {
        homeView.classList.add("active-view");
        dashboardView.classList.remove("active-view");
        navHome.classList.add("active-link");
        navDashboard.classList.remove("active-link");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        homeView.classList.remove("active-view");
        dashboardView.classList.add("active-view");
        navHome.classList.remove("active-link");
        navDashboard.classList.add("active-link");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Redraw chart when dashboard opens to ensure correct sizing
        setTimeout(drawWeeklyChart, 100);
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    const themeBtn = document.getElementById("themeToggleBtn");
    if (themeBtn) {
        themeBtn.innerText = theme === "dark" ? "☀️" : "🌙";
        themeBtn.title = theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";
    }
    drawWeeklyChart(); // Re-render canvas with theme colors
}

// ==========================================================================
// 2. LIVE CLOCK & TIMEZONES
// ==========================================================================

function updateDateTime() {
    const now = new Date();
    const tzSelect = document.getElementById("timezoneSelect");
    const timezone = tzSelect ? tzSelect.value : "local";

    const dateOptions = { weekday: "long", year: "numeric", month: "short", day: "numeric" };
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };

    if (timezone !== "local") {
        dateOptions.timeZone = timezone;
        timeOptions.timeZone = timezone;
    }

    const dateEl = document.getElementById("date");
    const clockEl = document.getElementById("clock");
    if (dateEl) dateEl.innerText = now.toLocaleDateString(undefined, dateOptions);
    if (clockEl) clockEl.innerText = now.toLocaleTimeString(undefined, timeOptions);
}

// ==========================================================================
// 3. AUDIO SYNTHESIZER (WEB AUDIO API)
// ==========================================================================

function playTimerChime() {
    if (!soundEnabled) return;
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        // Pleasant melodic chord progression (C5 -> E5 -> G5)
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now + index * 0.12);

            gain.gain.setValueAtTime(0.25, now + index * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.9);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + index * 0.12);
            osc.stop(now + index * 0.12 + 0.95);
        });
    } catch (err) {
        console.warn("Audio synthesis error:", err);
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem(STORAGE_KEYS.SOUND, soundEnabled);
    updateSoundButtonUI();
}

function updateSoundButtonUI() {
    const soundBtn = document.getElementById("timerSoundBtn");
    if (soundBtn) {
        soundBtn.innerHTML = soundEnabled ? "🔔 Sound Alert: On" : "🔕 Sound Alert: Muted";
    }
}

// ==========================================================================
// 4. TIMER & POMODORO ENGINE
// ==========================================================================

function switchTimerMode(mode) {
    if (timerInterval) pauseTimer();
    timerMode = mode;

    document.getElementById("tabStopwatch").classList.toggle("active", mode === "stopwatch");
    document.getElementById("tabPomodoro").classList.toggle("active", mode === "pomodoro");
    document.getElementById("pomodoroPresets").style.display = mode === "pomodoro" ? "flex" : "none";

    renderTimerDisplay();
}

function setPomodoroPreset(minutes, element) {
    if (timerInterval) pauseTimer();
    pomodoroDuration = minutes * 60;
    pomodoroRemaining = pomodoroDuration;

    document.querySelectorAll(".pomodoro-preset-btn").forEach(btn => btn.classList.remove("active"));
    if (element) element.classList.add("active");

    renderTimerDisplay();
}

function startTimer() {
    if (!activeTask) {
        alert("Please click any task from the list to assign this focus session!");
        return;
    }

    if (timerInterval) return; // Already running

    isTimerRunning = true;
    timerLastTimestamp = Date.now();
    updateTimerControlButtons();

    timerInterval = setInterval(() => {
        const now = Date.now();
        const deltaMs = now - timerLastTimestamp;

        if (deltaMs >= 1000) {
            const deltaSeconds = Math.floor(deltaMs / 1000);
            timerLastTimestamp += deltaSeconds * 1000;
            const todayKey = new Date().toISOString().split('T')[0];

            if (timerMode === "stopwatch") {
                activeTask.actualSeconds = (activeTask.actualSeconds || 0) + deltaSeconds;
                recordDailyStudySeconds(todayKey, deltaSeconds);
                renderTimerDisplay();
                updateTaskCardTime(activeTask.id);
                syncBrowserTitle(formatSecondsCompact(activeTask.actualSeconds));
            } else {
                // Pomodoro mode
                if (pomodoroRemaining > 0) {
                    const actualDelta = Math.min(pomodoroRemaining, deltaSeconds);
                    pomodoroRemaining -= actualDelta;
                    activeTask.actualSeconds = (activeTask.actualSeconds || 0) + actualDelta;
                    recordDailyStudySeconds(todayKey, actualDelta);
                    renderTimerDisplay();
                    updateTaskCardTime(activeTask.id);
                    syncBrowserTitle(formatMMSS(pomodoroRemaining));

                    if (pomodoroRemaining === 0) {
                        pauseTimer();
                        playTimerChime();
                        launchConfetti();
                        alert(`🎉 Pomodoro completed for: ${activeTask.title}! Take a well-deserved break.`);
                    }
                }
            }
            updateGlobalStats();
            saveDatabase();
        }
    }, 250);
}

function pauseTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    timerLastTimestamp = null;
    isTimerRunning = false;
    updateTimerControlButtons();
    saveDatabase();
    syncBrowserTitle(null);
}

function resetTimer() {
    pauseTimer();
    if (timerMode === "pomodoro") {
        pomodoroRemaining = pomodoroDuration;
    } else if (activeTask) {
        if (confirm(`Reset tracked time on "${activeTask.title}" back to 0s?`)) {
            activeTask.actualSeconds = 0;
            updateTaskCardTime(activeTask.id);
            saveDatabase();
        }
    }
    renderTimerDisplay();
    updateGlobalStats();
}

function selectTaskForTimer(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (activeTask && activeTask.id === taskId && isTimerRunning) {
        return; // Already timing this task
    }

    if (isTimerRunning) {
        pauseTimer();
    }

    activeTask = task;
    document.getElementById("timerTaskName").innerText = task.title;
    renderTimerDisplay();
    displayTasks(); // Update selection highlight in list
}

function renderTimerDisplay() {
    const displayEl = document.getElementById("timerDisplay");
    if (!displayEl) return;

    if (timerMode === "pomodoro") {
        displayEl.innerText = formatMMSS(pomodoroRemaining);
    } else {
        const secs = activeTask ? (activeTask.actualSeconds || 0) : 0;
        displayEl.innerText = formatHHMMSS(secs);
    }
}

function updateTimerControlButtons() {
    const startBtn = document.getElementById("timerStartBtn");
    if (startBtn) {
        if (isTimerRunning) {
            startBtn.innerHTML = "⏸ Pause Timer";
            startBtn.className = "timer-ctrl-btn timer-pause";
            startBtn.title = "Shortcut: Spacebar";
            startBtn.onclick = pauseTimer;
        } else {
            startBtn.innerHTML = "▶ Start Session";
            startBtn.className = "timer-ctrl-btn timer-start";
            startBtn.title = "Shortcut: Spacebar";
            startBtn.onclick = startTimer;
        }
    }
}

function syncBrowserTitle(timeString) {
    if (!timeString) {
        document.title = "Taskly - Study & Activity Organizer";
    } else {
        const icon = timerMode === "pomodoro" ? "🍅" : "⏱️";
        document.title = `(${icon} ${timeString}) Taskly`;
    }
}

// ==========================================================================
// 5. TASK MANAGEMENT (CRUD & PROGRESS)
// ==========================================================================

function addTask() {
    const titleInput = document.getElementById("title");
    const categoryInput = document.getElementById("category");
    const subjectInput = document.getElementById("subject");
    const priorityInput = document.getElementById("priority");
    const dueDateInput = document.getElementById("dueDate");
    const totalWorkInput = document.getElementById("totalWork");
    const completedWorkInput = document.getElementById("completedWork");

    const title = titleInput.value.trim();
    if (!title) {
        alert("Please enter a task title.");
        titleInput.focus();
        return;
    }

    const newTask = {
        id: Date.now(),
        title: title,
        category: categoryInput.value,
        subject: subjectInput.value.trim(),
        priority: priorityInput.value,
        dueDate: dueDateInput.value,
        totalWork: Math.max(0, Number(totalWorkInput.value) || 0),
        completedWork: Math.max(0, Number(completedWorkInput.value) || 0),
        completed: false,
        actualSeconds: 0,
        createdAt: new Date().toISOString()
    };

    if (newTask.totalWork > 0 && newTask.completedWork >= newTask.totalWork) {
        newTask.completed = true;
        newTask.completedAt = new Date().toISOString();
    }

    tasks.unshift(newTask);
    saveDatabase();
    displayTasks();

    // Reset inputs
    titleInput.value = "";
    subjectInput.value = "";
    dueDateInput.value = "";
    totalWorkInput.value = "";
    completedWorkInput.value = "";

    // Auto select newly added task for convenience
    selectTaskForTimer(newTask.id);
}

function toggleTaskComplete(id, event) {
    if (event) event.stopPropagation();
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    if (task.completed) {
        task.completedAt = new Date().toISOString();
        launchConfetti();
        if (task.totalWork > 0 && task.completedWork < task.totalWork) {
            task.completedWork = task.totalWork;
        }
    } else {
        delete task.completedAt;
    }

    saveDatabase();
    displayTasks();
    updateGlobalStats();
}

function changeTaskProgress(id, delta, event) {
    if (event) event.stopPropagation();
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const prevCompleted = task.completed;
    task.completedWork = Math.max(0, (task.completedWork || 0) + delta);

    if (task.totalWork > 0) {
        if (task.completedWork >= task.totalWork) {
            task.completedWork = task.totalWork;
            task.completed = true;
            if (!task.completedAt) task.completedAt = new Date().toISOString();
            if (!prevCompleted) launchConfetti();
        } else {
            task.completed = false;
            delete task.completedAt;
        }
    }

    saveDatabase();
    displayTasks();
    updateGlobalStats();
}

function deleteTask(id, event) {
    if (event) event.stopPropagation();
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (confirm(`Delete "${task.title}"?`)) {
        if (activeTask && activeTask.id === id) {
            pauseTimer();
            activeTask = null;
            document.getElementById("timerTaskName").innerText = "Select a task from the list";
            renderTimerDisplay();
        }
        tasks = tasks.filter(t => t.id !== id);
        saveDatabase();
        displayTasks();
        updateGlobalStats();
    }
}

// Edit Modal
let editingTaskId = null;

function openEditTaskModal(id, event) {
    if (event) event.stopPropagation();
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editingTaskId = id;
    document.getElementById("editTitle").value = task.title;
    document.getElementById("editCategory").value = task.category;
    document.getElementById("editSubject").value = task.subject || "";
    document.getElementById("editPriority").value = task.priority || "medium";
    document.getElementById("editDueDate").value = task.dueDate || "";
    document.getElementById("editTotalWork").value = task.totalWork || "";
    document.getElementById("editCompletedWork").value = task.completedWork || "";

    openModal("editTaskModal");
}

function saveEditedTask() {
    const task = tasks.find(t => t.id === editingTaskId);
    if (!task) return;

    const newTitle = document.getElementById("editTitle").value.trim();
    if (!newTitle) {
        alert("Task title cannot be empty.");
        return;
    }

    task.title = newTitle;
    task.category = document.getElementById("editCategory").value;
    task.subject = document.getElementById("editSubject").value.trim();
    task.priority = document.getElementById("editPriority").value;
    task.dueDate = document.getElementById("editDueDate").value;
    task.totalWork = Math.max(0, Number(document.getElementById("editTotalWork").value) || 0);
    task.completedWork = Math.max(0, Number(document.getElementById("editCompletedWork").value) || 0);

    if (task.totalWork > 0 && task.completedWork >= task.totalWork) {
        task.completed = true;
        if (!task.completedAt) task.completedAt = new Date().toISOString();
    } else if (task.totalWork > 0 && task.completedWork < task.totalWork && task.completed) {
        task.completed = false;
        delete task.completedAt;
    }

    saveDatabase();
    closeModal("editTaskModal");
    displayTasks();
    updateGlobalStats();

    if (activeTask && activeTask.id === task.id) {
        document.getElementById("timerTaskName").innerText = task.title;
    }
}

function chooseSport(gameName) {
    document.getElementById("category").value = "Sports";
    document.getElementById("subject").value = gameName;
    document.getElementById("title").value = `${gameName} Training Session`;
    document.getElementById("title").focus();
}

// ==========================================================================
// 6. FILTERING, SEARCH & SORTING
// ==========================================================================

function filterByCategory(category, element) {
    currentCategoryFilter = category;
    document.querySelectorAll(".pill-category").forEach(btn => btn.classList.remove("active"));
    if (element) element.classList.add("active");
    displayTasks();
}

function filterByStatus(status, element) {
    currentStatusFilter = status;
    document.querySelectorAll(".pill-status").forEach(btn => btn.classList.remove("active"));
    if (element) element.classList.add("active");
    displayTasks();
}

function handleSearch(query) {
    currentSearchQuery = query.toLowerCase().trim();
    displayTasks();
}

function handleSort(sortKey) {
    currentSort = sortKey;
    displayTasks();
}

function getFilteredAndSortedTasks() {
    let result = tasks.filter(task => {
        // Category filter
        if (currentCategoryFilter !== "All" && task.category !== currentCategoryFilter) {
            return false;
        }
        // Status filter
        if (currentStatusFilter === "active" && task.completed) return false;
        if (currentStatusFilter === "completed" && !task.completed) return false;

        // Search filter
        if (currentSearchQuery) {
            const titleMatch = task.title.toLowerCase().includes(currentSearchQuery);
            const subjectMatch = (task.subject || "").toLowerCase().includes(currentSearchQuery);
            const categoryMatch = task.category.toLowerCase().includes(currentSearchQuery);
            if (!titleMatch && !subjectMatch && !categoryMatch) return false;
        }

        return true;
    });

    // Sort result
    result.sort((a, b) => {
        switch (currentSort) {
            case "priority": {
                const priorityWeight = { high: 3, medium: 2, low: 1 };
                return (priorityWeight[b.priority || "medium"] || 2) - (priorityWeight[a.priority || "medium"] || 2);
            }
            case "dueDate": {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            }
            case "timeSpent": {
                return (b.actualSeconds || 0) - (a.actualSeconds || 0);
            }
            case "title": {
                return a.title.localeCompare(b.title);
            }
            case "newest":
            default: {
                return b.id - a.id;
            }
        }
    });

    return result;
}

// ==========================================================================
// 7. TASK LIST RENDERING
// ==========================================================================

function displayTasks() {
    const list = document.getElementById("taskList");
    if (!list) return;

    const filtered = getFilteredAndSortedTasks();
    list.innerHTML = "";

    if (filtered.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
                <h4 style="font-size: 16px; margin-bottom: 4px; color: var(--text-main);">No tasks found</h4>
                <p style="font-size: 13px;">Try adjusting your filters or search query, or add a new task.</p>
            </div>
        `;
        updateGlobalStats();
        return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    filtered.forEach(task => {
        const isSelected = activeTask && activeTask.id === task.id;
        const taskEl = document.createElement("div");
        taskEl.className = `task ${task.completed ? "completed" : ""} ${isSelected ? "active-selected" : ""}`;
        taskEl.onclick = () => selectTaskForTimer(task.id);

        // Calculate progress percentage
        let progressPercent = 0;
        if (task.totalWork > 0) {
            progressPercent = Math.min(100, Math.round((task.completedWork / task.totalWork) * 100));
        }

        // Priority badge
        const priority = task.priority || "medium";
        const priorityLabels = { high: "🔥 High", medium: "⚡ Medium", low: "🟢 Low" };
        const priorityBadge = `<span class="badge badge-priority-${priority}">${priorityLabels[priority]}</span>`;

        // Due date badge
        let dueDateBadge = "";
        if (task.dueDate) {
            if (task.dueDate < todayStr && !task.completed) {
                dueDateBadge = `<span class="badge badge-due-overdue">⚠️ Overdue (${task.dueDate})</span>`;
            } else if (task.dueDate === todayStr) {
                dueDateBadge = `<span class="badge badge-due-today">⏰ Due Today</span>`;
            } else {
                dueDateBadge = `<span class="badge badge-due-future">📅 ${task.dueDate}</span>`;
            }
        }

        taskEl.innerHTML = `
            <div class="task-top-row">
                <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""} 
                       onclick="toggleTaskComplete(${task.id}, event)" title="Mark completed">
                
                <div class="task-main">
                    <div class="task-title">${escapeHTML(task.title)}</div>
                    <div class="task-meta-row">
                        <span class="badge badge-category">${task.category}</span>
                        ${task.subject ? `<span style="color: var(--text-muted); font-size: 12px;">• ${escapeHTML(task.subject)}</span>` : ""}
                        ${priorityBadge}
                        ${dueDateBadge}
                    </div>
                </div>
            </div>

            ${task.totalWork > 0 ? `
                <div class="task-progress-row">
                    <div class="progress-bar-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <div class="progress-label">${task.completedWork} / ${task.totalWork} units (${progressPercent}%)</div>
                    </div>
                    <div class="quick-progress-controls">
                        <button class="quick-prog-btn" onclick="changeTaskProgress(${task.id}, -1, event)" title="Decrement work">-</button>
                        <button class="quick-prog-btn" onclick="changeTaskProgress(${task.id}, 1, event)" title="Increment work">+</button>
                    </div>
                </div>
            ` : ""}

            <div class="task-bottom-row">
                <div class="task-time-badge" id="task-time-${task.id}">
                    ⏱️ ${formatSecondsCompact(task.actualSeconds || 0)}
                </div>
                <div class="task-action-btns">
                    <button class="task-btn task-btn-edit" onclick="openEditTaskModal(${task.id}, event)">
                        ✏️ Edit
                    </button>
                    <button class="task-btn task-btn-delete" onclick="deleteTask(${task.id}, event)">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;

        list.appendChild(taskEl);
    });

    updateGlobalStats();
}

function updateTaskCardTime(taskId) {
    const badge = document.getElementById(`task-time-${taskId}`);
    if (badge && activeTask) {
        badge.innerHTML = `⏱️ ${formatSecondsCompact(activeTask.actualSeconds || 0)}`;
    }
}

// ==========================================================================
// 8. ANALYTICS, CHARTS & STREAKS
// ==========================================================================

function recordDailyStudySeconds(dateKey, deltaSeconds) {
    dailyStats[dateKey] = (dailyStats[dateKey] || 0) + deltaSeconds;
    localStorage.setItem(STORAGE_KEYS.DAILY_STATS, JSON.stringify(dailyStats));
    // Redraw chart periodically
    if (activeTask && activeTask.actualSeconds % 10 === 0) {
        drawWeeklyChart();
    }
}

function calculateStreak() {
    let streak = 0;
    const now = new Date();

    for (let i = 0; i < 60; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];

        const hasActivity = (dailyStats[key] && dailyStats[key] > 0) || 
                            tasks.some(t => t.completed && (
                                (t.completedAt && t.completedAt.startsWith(key)) ||
                                (!t.completedAt && t.createdAt && t.createdAt.startsWith(key))
                            ));

        if (hasActivity) {
            streak++;
        } else {
            // Allow today to still be 0 if it's the start of the day
            if (i === 0) continue;
            break;
        }
    }
    return Math.max(streak, 1); // Minimum 1 day active for encouragement
}

function drawWeeklyChart() {
    const canvas = document.getElementById("weeklyChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) return;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Get last 7 days data
    const daysData = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const dayLabel = dayNames[d.getDay()];
        const seconds = dailyStats[key] || 0;
        daysData.push({ key, label: dayLabel, minutes: Math.round(seconds / 60) });
    }

    // Colors based on theme
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const barColor = isDark ? "#818cf8" : "#6366f1";
    const barHoverColor = isDark ? "#a5b4fc" : "#4f46e5";
    const textColor = isDark ? "#94a3b8" : "#64748b";
    const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

    ctx.clearRect(0, 0, width, height);

    const maxMinutes = Math.max(60, ...daysData.map(d => d.minutes));
    const paddingBottom = 26;
    const paddingTop = 20;
    const chartHeight = height - paddingBottom - paddingTop;
    const barWidth = Math.min(38, (width / 7) - 16);
    const spacing = width / 7;

    // Draw horizontal benchmark lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let p = 0; p <= 1; p += 0.5) {
        const y = height - paddingBottom - (p * chartHeight);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // Draw bars
    daysData.forEach((item, index) => {
        const x = index * spacing + (spacing - barWidth) / 2;
        const barH = Math.max(4, (item.minutes / maxMinutes) * chartHeight);
        const y = height - paddingBottom - barH;

        // Rounded bar top
        ctx.fillStyle = barColor;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, [6, 6, 0, 0]);
        ctx.fill();

        // Minutes text on top of bar
        if (item.minutes > 0) {
            ctx.fillStyle = textColor;
            ctx.font = "bold 10px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`${item.minutes}m`, x + barWidth / 2, y - 5);
        }

        // Day label below bar
        ctx.fillStyle = textColor;
        ctx.font = "600 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(item.label, x + barWidth / 2, height - 8);
    });
}

function updateGlobalStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const remaining = total - completed;
    const totalSeconds = tasks.reduce((sum, t) => sum + (t.actualSeconds || 0), 0);

    const totalTasksEl = document.getElementById("totalTasks");
    const completedTasksEl = document.getElementById("completedTasks");
    const remainingTasksEl = document.getElementById("remainingTasks");
    const totalTimeEl = document.getElementById("totalTime");

    if (totalTasksEl) totalTasksEl.innerText = total;
    if (completedTasksEl) completedTasksEl.innerText = completed;
    if (remainingTasksEl) remainingTasksEl.innerText = remaining;
    if (totalTimeEl) totalTimeEl.innerText = formatSecondsCompact(totalSeconds);

    // Update streak counter
    const streak = calculateStreak();
    const streakEl = document.getElementById("streakNumber");
    if (streakEl) streakEl.innerText = `🔥 ${streak} Days`;
}

// ==========================================================================
// 9. DATA BACKUP & RESTORE (JSON & CSV)
// ==========================================================================

function exportJSONBackup() {
    const backupData = {
        version: "2.0",
        exportDate: new Date().toISOString(),
        tasks: tasks,
        dailyStats: dailyStats
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `taskly_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function exportCSVData() {
    const headers = ["Title", "Category", "Subject", "Priority", "Due Date", "Completed Work", "Total Goal", "Time Spent (Seconds)", "Is Completed", "Completed At"];
    const rows = tasks.map(t => [
        `"${(t.title || '').replace(/"/g, '""')}"`,
        `"${t.category || ''}"`,
        `"${(t.subject || '').replace(/"/g, '""')}"`,
        `"${t.priority || 'medium'}"`,
        `"${t.dueDate || ''}"`,
        t.completedWork || 0,
        t.totalWork || 0,
        t.actualSeconds || 0,
        t.completed ? "Yes" : "No",
        `"${t.completedAt || ''}"`
    ]);

    // Prepend UTF-8 Byte Order Mark (\uFEFF) for Excel compatibility
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `taskly_tasks_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importJSONFile(inputElement) {
    const file = inputElement.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.tasks && Array.isArray(data.tasks)) {
                tasks = data.tasks;
                if (data.dailyStats) dailyStats = data.dailyStats;
                saveDatabase();
                displayTasks();
                drawWeeklyChart();
                closeModal("backupModal");
                alert(`✅ Successfully imported ${tasks.length} tasks!`);
            } else if (Array.isArray(data)) {
                tasks = data;
                saveDatabase();
                displayTasks();
                closeModal("backupModal");
                alert(`✅ Successfully imported ${tasks.length} tasks!`);
            } else {
                alert("Invalid Taskly backup format.");
            }
        } catch (err) {
            alert("Error reading JSON file. Please verify valid JSON format.");
            console.error(err);
        }
    };
    reader.readAsText(file);
}

function resetAllData() {
    if (confirm("⚠️ Are you sure you want to delete all tasks and time records? This cannot be undone.")) {
        tasks = [];
        dailyStats = {};
        activeTask = null;
        pauseTimer();
        saveDatabase();
        displayTasks();
        drawWeeklyChart();
        closeModal("backupModal");
        alert("All Taskly data has been reset.");
    }
}

function saveDatabase() {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    localStorage.setItem(STORAGE_KEYS.DAILY_STATS, JSON.stringify(dailyStats));
}

// ==========================================================================
// 10. MODAL DIALOGS
// ==========================================================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add("active");
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("active");
}

function initModalBackdrops() {
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                overlay.classList.remove("active");
            }
        });
    });
}

function handleMockAuth(provider) {
    alert(`Logged in successfully with ${provider}! (Demo authentication)`);
    closeModal("loginModal");
}

// ==========================================================================
// 11. CONFETTI CELEBRATION ENGINE
// ==========================================================================

let confettiParticles = [];
let confettiAnimId = null;

function launchConfetti() {
    const canvas = document.getElementById("confetti-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    confettiParticles = [];
    const colors = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#3b82f6"];

    for (let i = 0; i < 70; i++) {
        confettiParticles.push({
            x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
            y: window.innerHeight / 2 - 50,
            size: Math.random() * 8 + 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            vx: (Math.random() - 0.5) * 14,
            vy: Math.random() * -12 - 4,
            rotation: Math.random() * 360,
            vRot: (Math.random() - 0.5) * 10,
            opacity: 1
        });
    }

    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
    animateConfetti();
}

function animateConfetti() {
    const canvas = document.getElementById("confetti-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    confettiParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4; // gravity
        p.rotation += p.vRot;
        p.opacity -= 0.012;

        if (p.opacity > 0) {
            alive = true;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.opacity);
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        }
    });

    if (alive) {
        confettiAnimId = requestAnimationFrame(animateConfetti);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confettiAnimId = null;
    }
}

// ==========================================================================
// 12. UTILITY FORMATTERS
// ==========================================================================

function formatHHMMSS(totalSeconds) {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = n => String(n).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

function formatMMSS(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const pad = n => String(n).padStart(2, '0');
    return `${pad(mins)}:${pad(secs)}`;
}

function formatSecondsCompact(seconds) {
    if (!seconds) return "0s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
}

function escapeHTML(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ==========================================================================
// 13. KEYBOARD SHORTCUTS & APP BOOTSTRAP
// ==========================================================================

function initKeyboardShortcuts() {
    window.addEventListener("keydown", (e) => {
        // 1. Esc key closes any active modal
        if (e.key === "Escape") {
            const activeModal = document.querySelector(".modal-overlay.active");
            if (activeModal) {
                activeModal.classList.remove("active");
                return;
            }
        }

        const activeTag = document.activeElement ? document.activeElement.tagName : "";
        const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(activeTag) ||
                         (document.activeElement && document.activeElement.isContentEditable);

        // 2. Ctrl+K or Cmd+K or '/' to focus search input
        if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") || (!isTyping && e.key === "/")) {
            e.preventDefault();
            switchTab("dashboard");
            const searchInput = document.getElementById("taskSearchInput");
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
            return;
        }

        // 3. '?' opens keyboard shortcuts cheat sheet
        if (!isTyping && e.key === "?") {
            e.preventDefault();
            openModal("shortcutsModal");
            return;
        }

        // 4. Spacebar toggles start / pause on focus timer (when not typing and no modal open)
        if (e.code === "Space" && !isTyping) {
            const hasActiveModal = document.querySelector(".modal-overlay.active");
            if (!hasActiveModal) {
                e.preventDefault();
                if (isTimerRunning) {
                    pauseTimer();
                } else {
                    startTimer();
                }
            }
        }
    });

    // Automatically pause timer and commit state to localStorage when tab closes or refreshes
    window.addEventListener("beforeunload", () => {
        if (isTimerRunning) {
            pauseTimer();
        }
    });
}

function registerServiceWorker() {
    if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
        navigator.serviceWorker.register("./sw.js")
            .then(reg => console.log("Taskly Service Worker registered:", reg.scope))
            .catch(err => console.log("Service Worker notice:", err));
    }
}

window.addEventListener("DOMContentLoaded", () => {
    initTheme();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    updateSoundButtonUI();

    // Render tasks and analytics
    displayTasks();
    if (tasks.length > 0) {
        selectTaskForTimer(tasks[0].id);
    }
    setTimeout(drawWeeklyChart, 150);

    // Initialize keyboard shortcuts & modal dismissal
    initKeyboardShortcuts();
    initModalBackdrops();

    // Register PWA Service Worker if served via HTTP/HTTPS
    registerServiceWorker();

    // Responsive redraw of canvas chart
    window.addEventListener("resize", () => {
        drawWeeklyChart();
    });
});
