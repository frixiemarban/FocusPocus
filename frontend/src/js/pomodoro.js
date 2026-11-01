document.addEventListener("DOMContentLoaded", () => {
    const taskInput = document.querySelector(".task-input");
    const addTaskBtn = document.querySelector(".add-task-btn");
    const taskContainer = document.getElementById("task-list-container");
    const progressBadge = document.querySelector(".progress-badge");

    // Function to add a new task dynamically
    function addTask() {
        const taskText = taskInput.value.trim();
        if (!taskText) return; // Don't add empty tasks

        const taskItem = document.createElement("label");
        taskItem.className = "task-item";

        // Clean template without the extra <i> tag; CSS handles the checkmark automatically
        taskItem.innerHTML = `
            <input type="checkbox">
            <span class="checkbox-custom"></span>
            <span class="task-text">${taskText}</span>
        `;

        taskContainer.appendChild(taskItem);
        taskInput.value = "";
        updateTaskCounter();
    }

    // Event listener for the Add button
    if (addTaskBtn) {
        addTaskBtn.addEventListener("click", (e) => {
            e.preventDefault();
            addTask();
        });
    }

    // Event listener for pressing "Enter" in the input field
    if (taskInput) {
        taskInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                addTask();
            }
        });
    }

    // Event delegation for checking/unchecking tasks to handle completed styles & counter
    if (taskContainer) {
        taskContainer.addEventListener("change", (e) => {
            if (e.target.type === "checkbox") {
                const taskItem = e.target.closest(".task-item");
                if (e.target.checked) {
                    taskItem.classList.add("completed");
                } else {
                    taskItem.classList.remove("completed");
                }
                updateTaskCounter();
            }
        });
    }

    // Function to update the top-right progress badge (e.g., 1/3)
    function updateTaskCounter() {
        if (!progressBadge) return;
        const totalTasks = taskContainer.querySelectorAll(".task-item").length;
        const completedTasks = taskContainer.querySelectorAll(".task-item.completed").length;
        progressBadge.textContent = `${completedTasks}/${totalTasks}`;
    }

    // Run once on load to sync initial count
    updateTaskCounter();
});


document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. TASK LIST & PROGRESS BADGE LOGIC
    // ==========================================
    const taskInput = document.querySelector(".task-input");
    const addTaskBtn = document.querySelector(".add-task-btn");
    const taskContainer = document.getElementById("task-list-container");
    const progressBadge = document.querySelector(".progress-badge");

    function addTask() {
        const taskText = taskInput.value.trim();
        if (!taskText) return;

        const taskItem = document.createElement("label");
        taskItem.className = "task-item";

        taskItem.innerHTML = `
            <input type="checkbox">
            <span class="checkbox-custom"></span>
            <span class="task-text">${taskText}</span>
        `;

        taskContainer.appendChild(taskItem);
        taskInput.value = "";
        updateTaskCounter();
    }

    if (addTaskBtn) {
        addTaskBtn.addEventListener("click", (e) => {
            e.preventDefault();
            addTask();
        });
    }

    if (taskInput) {
        taskInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                addTask();
            }
        });
    }

    if (taskContainer) {
        taskContainer.addEventListener("change", (e) => {
            if (e.target.type === "checkbox") {
                const taskItem = e.target.closest(".task-item");
                if (e.target.checked) {
                    taskItem.classList.add("completed");
                } else {
                    taskItem.classList.remove("completed");
                }
                updateTaskCounter();
            }
        });
    }

    function updateTaskCounter() {
        if (!progressBadge) return;
        const totalTasks = taskContainer.querySelectorAll(".task-item").length;
        const completedTasks = taskContainer.querySelectorAll(".task-item.completed").length;
        progressBadge.textContent = `${completedTasks}/${totalTasks}`;
    }

    updateTaskCounter();

    // ==========================================
    // 2. TIMER & COUNTDOWN LOGIC
    // ==========================================
    let timerInterval = null;
    let totalSeconds = 25 * 60; // Default 25 minutes
    let isRunning = false;
    let currentMode = 'focus'; // 'focus', 'short', 'long'
    let currentRound = 1;
    const maxRounds = 4;

    const timerDigits = document.querySelector(".timer-digits");
    const startBtn = document.querySelector(".start-session-btn");
    const secondaryCtrlBtns = document.querySelectorAll(".secondary-controls .ctrl-btn");
    const pauseBtn = secondaryCtrlBtns[0]; // First secondary button: Pause
    const resetBtn = secondaryCtrlBtns[1]; // Second secondary button: Reset
    const modeBtns = document.querySelectorAll(".mode-btn");
    const timerLabelTop = document.querySelector(".timer-label-top");
    const roundDots = document.querySelectorAll(".rounds-indicator .dot");
    const roundsText = document.querySelector(".rounds-text");

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function updateTimerDisplay() {
        if (timerDigits) {
            timerDigits.textContent = formatTime(totalSeconds);
            document.title = `(${timerDigits.textContent}) FocusCraft Pomodoro`;
        }
    }

    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        if (startBtn) {
            startBtn.innerHTML = `<i class="fa-solid fa-pause"></i> Pause Session`;
            startBtn.style.opacity = "0.9";
        }

        timerInterval = setInterval(() => {
            if (totalSeconds > 0) {
                totalSeconds--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                isRunning = false;
                handleTimerComplete();
            }
        }, 1000);
    }

    function pauseTimer() {
        isRunning = false;
        clearInterval(timerInterval);
        if (startBtn) {
            startBtn.innerHTML = `<i class="fa-solid fa-play"></i> Resume Session`;
            startBtn.style.opacity = "1";
        }
    }

    function resetTimer() {
        pauseTimer();
        if (currentMode === 'focus') totalSeconds = 25 * 60;
        else if (currentMode === 'short') totalSeconds = 5 * 60;
        else if (currentMode === 'long') totalSeconds = 15 * 60;
        updateTimerDisplay();
        if (startBtn) {
            startBtn.innerHTML = `<i class="fa-solid fa-play"></i> Start Session`;
        }
    }

    function handleTimerComplete() {
        alert(`${currentMode === 'focus' ? 'Focus session' : 'Break'} completed!`);
        if (currentMode === 'focus') {
            if (currentRound < maxRounds) {
                currentRound++;
            } else {
                currentRound = 1;
            }
            updateRoundsUI();
        }
        resetTimer();
    }

    function updateRoundsUI() {
        if (roundsText && roundDots.length > 0) {
            roundsText.textContent = `${currentRound} of ${maxRounds} rounds`;
            roundDots.forEach((dot, index) => {
                if (index < currentRound - 1) {
                    dot.classList.add("active");
                } else {
                    dot.classList.remove("active");
                }
            });
        }
    }

    // Mode Switcher Tabs Event Listeners
    modeBtns.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            modeBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            pauseTimer();

            if (index === 0) {
                currentMode = 'focus';
                totalSeconds = 25 * 60;
                if (timerLabelTop) timerLabelTop.textContent = "FOCUS SESSION";
            } else if (index === 1) {
                currentMode = 'short';
                totalSeconds = 5 * 60;
                if (timerLabelTop) timerLabelTop.textContent = "SHORT BREAK";
            } else if (index === 2) {
                currentMode = 'long';
                totalSeconds = 15 * 60;
                if (timerLabelTop) timerLabelTop.textContent = "LONG BREAK";
            }

            updateTimerDisplay();
            if (startBtn) {
                startBtn.innerHTML = `<i class="fa-solid fa-play"></i> Start Session`;
            }
        });
    });

    // Control Buttons
    if (startBtn) {
        startBtn.addEventListener("click", () => {
            if (!isRunning) startTimer();
            else pauseTimer();
        });
    }

    if (pauseBtn) {
        pauseBtn.addEventListener("click", pauseTimer);
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", resetTimer);
    }

    // Initialize timer display on page load
    updateTimerDisplay();
});