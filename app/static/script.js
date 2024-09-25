// DOM elements
const timerDisplay = document.getElementById('timer');
const controlBtn = document.getElementById('controlBtn');
const startStopBtn = document.getElementById('startStopBtn');
const timerTabs = document.querySelectorAll('.timer-tab');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const settingsBtn = document.getElementById('settingsBtn');
const dashboardBtn = document.getElementById('dashboardBtn');
const settingsModal = document.getElementById('settingsModal');
const dashboardModal = document.getElementById('dashboardModal');
const closeButtons = document.querySelectorAll('.close-modal');
const saveSettingsBtn = document.getElementById('saveSettings');
const invertLayoutCheckbox = document.getElementById('invertLayout');
const taskModal = document.getElementById('taskModal');
const taskModalTitle = document.getElementById('taskModalTitle');
const taskModalDescription = document.getElementById('taskModalDescription');
const taskDeleteBtn = document.getElementById('taskDelete');
const taskArchiveBtn = document.getElementById('taskArchive');
const taskStatusBtn = document.getElementById('taskStatus');
const allTasksBtn = document.getElementById('allTasksBtn');
const allTasksModal = document.getElementById('allTasksModal');
const allTasksList = document.getElementById('allTasksList');
const dateFilter = document.getElementById('dateFilter');
const archivedFilter = document.getElementById('archivedFilter');
const completedFilter = document.getElementById('completedFilter');
const closeModal = allTasksModal.querySelector('.close-modal');

// Timer variables
let timer;
let timeLeft = 25 * 60;
let isRunning = false;
let currentMode = 'pomodoro';

// Task status enum
const TaskStatus = {
    PENDING: 'pending',
    IN_PROGRESS: 'in-progress',
    DONE: 'done'
};

// Update timer display
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Toggle timer (start/pause)
function toggleTimer() {
    if (!isRunning) {
        startTimer();
    } else {
        pauseTimer();
    }
}

// Start timer
function startTimer() {
    if (timeLeft <= 0) {
        resetTimer(getCurrentModeTime());
    }
    isRunning = true;
    controlBtn.textContent = 'PAUSE';
    startStopBtn.querySelector('svg').innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
    timer = setInterval(() => {
        timeLeft--;
        updateDisplay();
        if (timeLeft <= 0) {
            clearInterval(timer);
            if (currentMode === 'pomodoro') {
                saveSession();
                updateDashboard();
            }
            alert(`${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)} completed!`);
            isRunning = false;
            controlBtn.textContent = 'START';
            startStopBtn.querySelector('svg').innerHTML = '<path d="M8 5v14l11-7z"/>';
            resetTimer(getCurrentModeTime());
        }
    }, 1000);
}

// Pause timer
function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
    controlBtn.textContent = 'START';
    startStopBtn.querySelector('svg').innerHTML = '<path d="M8 5v14l11-7z"/>';
}

// Reset timer
function resetTimer(minutes) {
    clearInterval(timer);
    timeLeft = minutes * 60;
    isRunning = false;
    controlBtn.textContent = 'START';
    startStopBtn.querySelector('svg').innerHTML = '<path d="M8 5v14l11-7z"/>';
    updateDisplay();
}

// Get current mode time
function getCurrentModeTime() {
    switch (currentMode) {
        case 'pomodoro':
            return parseInt(document.getElementById('pomodoroTime').value);
        case 'short break':
            return parseInt(document.getElementById('shortBreakTime').value);
        case 'long break':
            return parseInt(document.getElementById('longBreakTime').value);
        default:
            return 25;
    }
}

// Switch timer mode
function switchMode(mode, minutes) {
    currentMode = mode;
    resetTimer(minutes);
    timerTabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
}

// Add new task
function addTask(taskText, status = TaskStatus.PENDING) {
    const li = document.createElement('li');
    li.innerHTML = `
        <span class="task-text">${taskText}</span>
        <div class="task-buttons">
            <button class="svg-button task-delete">
                <svg viewBox="0 0 24 24" fill="white">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                </svg>
            </button>
            <button class="svg-button task-archive">
                <svg viewBox="0 0 24 24" fill="white">
                    <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"></path>
                </svg>
            </button>
            <button class="svg-button task-status task-status-${status}">
                <svg viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                </svg>
            </button>
        </div>
    `;
    li.dataset.status = status;
    taskList.appendChild(li);
    saveTasks();
}

// Save tasks to database
function saveTasks() {
    const tasks = Array.from(taskList.children).map(li => ({
        text: li.querySelector('.task-text').textContent,
        status: li.dataset.status
    }));
    fetch('/save_tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks }),
    });
}

// Load tasks from database
function loadTasks() {
    fetch('/get_tasks')
        .then(response => response.json())
        .then(tasks => {
            taskList.innerHTML = '';
            tasks.forEach(task => addTask(task.text, task.status));
        });
}

// Open task modal
function openTaskModal(taskElement) {
    const taskText = taskElement.querySelector('.task-text').textContent;
    const taskStatus = taskElement.dataset.status;
    
    taskModalTitle.textContent = taskText;
    taskModalDescription.textContent = `Status: ${taskStatus}`;
    taskStatusBtn.className = `svg-button task-status-${taskStatus}`;
    
    taskModal.style.display = 'block';
    
    // Update event listeners for modal buttons
    taskDeleteBtn.onclick = () => deleteTask(taskElement);
    taskArchiveBtn.onclick = () => archiveTask(taskElement);
    taskStatusBtn.onclick = () => cycleTaskStatus(taskElement);
}

// Delete task
function deleteTask(taskElement) {
    taskElement.remove();
    saveTasks();
    taskModal.style.display = 'none';
}

// Archive task
function archiveTask(taskElement) {
    // For now, we'll just remove the task. You can implement proper archiving later.
    deleteTask(taskElement);
}

// Cycle task status
function cycleTaskStatus(taskElement) {
    const statusButton = taskElement.querySelector('.task-status');
    const currentStatus = taskElement.dataset.status;
    let newStatus;
    
    switch (currentStatus) {
        case TaskStatus.PENDING:
            newStatus = TaskStatus.IN_PROGRESS;
            break;
        case TaskStatus.IN_PROGRESS:
            newStatus = TaskStatus.DONE;
            break;
        case TaskStatus.DONE:
            newStatus = TaskStatus.PENDING;
            break;
    }
    
    taskElement.dataset.status = newStatus;
    statusButton.className = `svg-button task-status task-status-${newStatus}`;
    saveTasks();
    
    if (taskModal.style.display === 'block') {
        openTaskModal(taskElement);
    }
}


allTasksBtn.addEventListener('click', () => {
    allTasksModal.style.display = 'block';
    loadAllTasks();
});

closeModal.addEventListener('click', () => {
    allTasksModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === allTasksModal) {
        allTasksModal.style.display = 'none';
    }
});

function loadAllTasks() {
    fetch('/get_all_tasks')
        .then(response => response.json())
        .then(tasks => {
            renderFilteredTasks(tasks);
        });
}

function renderFilteredTasks(tasks) {
    const filteredTasks = tasks.filter(task => {
        const dateMatch = !dateFilter.value || new Date(task.date).toDateString() === new Date(dateFilter.value).toDateString();
        const archivedMatch = archivedFilter.checked || !task.archived;
        const completedMatch = completedFilter.checked || task.status !== 'done';
        return dateMatch && archivedMatch && completedMatch;
    });

    allTasksList.innerHTML = '';
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="task-text">${task.text}</span>
            <div class="task-info">
                <span class="task-status">${task.status}</span>
                <span class="task-date">${task.date}</span>
            </div>
        `;
        allTasksList.appendChild(li);
    });
}

dateFilter.addEventListener('change', () => loadAllTasks());
archivedFilter.addEventListener('change', () => loadAllTasks());
completedFilter.addEventListener('change', () => loadAllTasks());

// Save settings to database
function saveSettings() {
    const settings = {
        pomodoroTime: parseInt(document.getElementById('pomodoroTime').value),
        shortBreakTime: parseInt(document.getElementById('shortBreakTime').value),
        longBreakTime: parseInt(document.getElementById('longBreakTime').value),
        invertLayout: document.getElementById('invertLayout').checked
    };
    
    fetch('/save_settings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
    }).then(response => response.json())
      .then(data => {
          if (data.status === 'success') {
              alert('Settings saved successfully');
              loadSettings();
          } else {
              alert('Failed to save settings');
          }
      });
}

// Load settings from database
function loadSettings() {
    fetch('/get_settings')
        .then(response => response.json())
        .then(settings => {
            document.getElementById('pomodoroTime').value = settings.pomodoroTime;
            document.getElementById('shortBreakTime').value = settings.shortBreakTime;
            document.getElementById('longBreakTime').value = settings.longBreakTime;
            document.getElementById('invertLayout').checked = settings.invertLayout;

            timerTabs[0].dataset.time = settings.pomodoroTime;
            timerTabs[1].dataset.time = settings.shortBreakTime;
            timerTabs[2].dataset.time = settings.longBreakTime;

            const activeTab = document.querySelector('.timer-tab.active');
            if (activeTab) {
                resetTimer(parseInt(activeTab.dataset.time));
            }

            applyLayout(settings.invertLayout);
        });
}

// Apply layout based on invert setting
function applyLayout(invert) {
    const container = document.querySelector('.container');
    if (invert) {
        container.classList.add('inverted');
    } else {
        container.classList.remove('inverted');
    }
}

// Save completed Pomodoro session
function saveSession() {
    fetch('/save_session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timestamp: new Date().toISOString() }),
    });
}

// Update dashboard
function updateDashboard() {
    fetch('/get_sessions')
        .then(response => response.json())
        .then(sessions => {
            const dashboardContent = document.getElementById('dashboardContent');
            dashboardContent.innerHTML = `
                <h3>Statistics</h3>
                <p>Completed Pomodoros: ${sessions.length}</p>
            `;
            renderChart(sessions);
        });
}

// Render chart
function renderChart(sessions) {
    const ctx = document.getElementById('pomodoroChart').getContext('2d');
    const dates = sessions.map(session => new Date(session.timestamp).toLocaleDateString());
    const counts = {};
    dates.forEach(date => {
        counts[date] = (counts[date] || 0) + 1;
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                label: 'Completed Pomodoros',
                data: Object.values(counts),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    stepSize: 1
                }
            }
        }
    });
}

// Event Listeners
controlBtn.addEventListener('click', toggleTimer);
startStopBtn.addEventListener('click', toggleTimer);

timerTabs.forEach(tab => {
    tab.addEventListener('click', (event) => {
        const time = parseInt(event.target.dataset.time);
        switchMode(event.target.textContent.toLowerCase(), time);
    });
});

taskInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && this.value.trim()) {
        addTask(this.value.trim());
        this.value = '';
    }
});

settingsBtn.addEventListener('click', () => settingsModal.style.display = 'block');
dashboardBtn.addEventListener('click', () => {
    dashboardModal.style.display = 'block';
    updateDashboard();
});

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        settingsModal.style.display = 'none';
        dashboardModal.style.display = 'none';
        taskModal.style.display = 'none';
    });
});

saveSettingsBtn.addEventListener('click', () => {
    saveSettings();
    settingsModal.style.display = 'none';
});

taskList.addEventListener('click', (e) => {
    const taskElement = e.target.closest('li');
    if (!taskElement) return;
    
    if (e.target.closest('.task-delete')) {
        deleteTask(taskElement);
    } else if (e.target.closest('.task-archive')) {
        archiveTask(taskElement);
    } else if (e.target.closest('.task-status')) {
        cycleTaskStatus(taskElement);
    } else if (e.target.closest('.task-text')) {
        openTaskModal(taskElement);
    }
});

// Close modals when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === settingsModal) settingsModal.style.display = 'none';
    if (event.target === dashboardModal) dashboardModal.style.display = 'none';
    if (event.target === taskModal) taskModal.style.display = 'none';
});

// Initialize
function init() {
    loadTasks();
    loadSettings();
    updateDisplay();
    updateDashboard();
}

init();
