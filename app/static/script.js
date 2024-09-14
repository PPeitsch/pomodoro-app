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

// Timer variables
let timer;
let timeLeft = 25 * 60;
let isRunning = false;
let currentMode = 'pomodoro';

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
        // If the timer is at 0 or negative, reset it before starting
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
            // Reset the timer to the current mode's time
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
            return 25; // Default to 25 minutes if something goes wrong
    }
}

// Switch timer mode
function switchMode(mode, minutes) {
    currentMode = mode;
    resetTimer(minutes);
    timerTabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
}

// Save tasks to database
function saveTasks() {
    const tasks = Array.from(taskList.children).map(li => li.textContent);
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
            tasks.forEach(task => {
                const li = document.createElement('li');
                li.textContent = task;
                taskList.appendChild(li);
            });
        });
}

// Add new task
function addTask(taskText) {
    const li = document.createElement('li');
    li.textContent = taskText;
    taskList.appendChild(li);
    saveTasks();
}

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
              loadSettings(); // Reload settings to apply changes
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

// Modify the event listener for timer tabs
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
    });
});

saveSettingsBtn.addEventListener('click', () => {
    saveSettings();
    settingsModal.style.display = 'none';
});

// Close modals when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === settingsModal) settingsModal.style.display = 'none';
    if (event.target === dashboardModal) dashboardModal.style.display = 'none';
});

// Initialize
function init() {
    loadTasks();
    loadSettings();
    updateDisplay();
    updateDashboard();
}

init();
