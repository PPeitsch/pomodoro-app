// DOM elements
const timerDisplay = document.getElementById('timer');
const controlBtn = document.getElementById('controlBtn');
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

// Start or pause timer
function toggleTimer() {
    if (!isRunning) {
        startTimer();
    } else {
        pauseTimer();
    }
}

// Start timer
function startTimer() {
    isRunning = true;
    controlBtn.textContent = 'PAUSE';
    timer = setInterval(() => {
        timeLeft--;
        updateDisplay();
        if (timeLeft === 0) {
            clearInterval(timer);
            showNotification('Pomodoro Timer', `Your ${currentMode} session is complete!`);
            isRunning = false;
            controlBtn.textContent = 'START';
        }
    }, 1000);
}

// Pause timer
function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
    controlBtn.textContent = 'START';
}

// Reset timer
function resetTimer(minutes) {
    clearInterval(timer);
    timeLeft = minutes * 60;
    isRunning = false;
    controlBtn.textContent = 'START';
    updateDisplay();
}

// Switch timer mode
function switchMode(mode, minutes) {
    currentMode = mode;
    resetTimer(minutes);
    timerTabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
}

// Save tasks to local storage
function saveTasks() {
    const tasks = Array.from(taskList.children).map(li => li.textContent);
    localStorage.setItem('pomodoro-tasks', JSON.stringify(tasks));
}

// Load tasks from local storage
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('pomodoro-tasks')) || [];
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = task;
        taskList.appendChild(li);
    });
}

// Add new task
function addTask(taskText) {
    const li = document.createElement('li');
    li.textContent = taskText;
    taskList.appendChild(li);
    saveTasks();
}

// Save settings to local storage
function saveSettings() {
    const settings = {
        pomodoroTime: document.getElementById('pomodoroTime').value,
        shortBreakTime: document.getElementById('shortBreakTime').value,
        longBreakTime: document.getElementById('longBreakTime').value,
        invertLayout: invertLayoutCheckbox.checked
    };
    localStorage.setItem('pomodoro-settings', JSON.stringify(settings));
}

// Load settings from local storage
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('pomodoro-settings'));
    if (settings) {
        document.getElementById('pomodoroTime').value = settings.pomodoroTime;
        document.getElementById('shortBreakTime').value = settings.shortBreakTime;
        document.getElementById('longBreakTime').value = settings.longBreakTime;
        invertLayoutCheckbox.checked = settings.invertLayout;

        timerTabs[0].dataset.time = settings.pomodoroTime;
        timerTabs[1].dataset.time = settings.shortBreakTime;
        timerTabs[2].dataset.time = settings.longBreakTime;

        applyLayout(settings.invertLayout);
    }
}

// Apply layout based on invert setting
function applyLayout(invert) {
    const buttonPanel = document.querySelector('.button-panel');
    const taskPanel = document.querySelector('.task-panel');
    if (invert) {
        buttonPanel.classList.remove('left');
        buttonPanel.classList.add('right');
        taskPanel.classList.remove('right');
        taskPanel.classList.add('left');
    } else {
        buttonPanel.classList.remove('right');
        buttonPanel.classList.add('left');
        taskPanel.classList.remove('left');
        taskPanel.classList.add('right');
    }
}

// Render focus chart in dashboard
function renderFocusChart() {
    const ctx = document.getElementById('focusChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Focus Hours',
                data: [2, 4, 3, 5, 2, 3, 1],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Show notification
function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
    }
}

// Event Listeners
controlBtn.addEventListener('click', toggleTimer);

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
    renderFocusChart();
});

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        settingsModal.style.display = 'none';
        dashboardModal.style.display = 'none';
    });
});

saveSettingsBtn.addEventListener('click', () => {
    saveSettings();
    loadSettings();
    settingsModal.style.display = 'none';
});

// Close modals when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === settingsModal) settingsModal.style.display = 'none';
    if (event.target === dashboardModal) dashboardModal.style.display = 'none';
});

// Keyboard shortcut for starting/pausing the timer (spacebar)
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && document.activeElement.tagName !== 'INPUT') {
        event.preventDefault();
        toggleTimer();
    }
});

// Initialize
function init() {
    loadTasks();
    loadSettings();
    updateDisplay();
    if ('Notification' in window) {
        Notification.requestPermission();
    }
}

init();
