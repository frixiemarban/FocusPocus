document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. TASK LIST & BACKEND SYNC LOGIC
    // ==========================================
    const API_BASE_URL = "http://127.0.0.1:8000";
    const taskInput = document.querySelector(".task-input");
    const addTaskBtn = document.querySelector(".add-task-btn");
    const taskContainer = document.getElementById("task-list-container");
    const progressBadge = document.querySelector(".progress-badge");

    // Fetch tasks from Python SQLite backend on load
    async function fetchTasks() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tasks`);
            if (!response.ok) throw new Error("Failed to fetch tasks");
            const tasks = await response.json();
            renderTasks(tasks);
        } catch (error) {
            console.error("Error loading tasks from backend:", error);
        }
    }

    // Render tasks into the HTML container
    function renderTasks(tasks) {
        taskContainer.innerHTML = "";
        tasks.forEach(task => {
            const taskItem = document.createElement("label");
            taskItem.className = `task-item ${task.completed ? "completed" : ""}`;
            taskItem.dataset.id = task.id;

            taskItem.innerHTML = `
                <input type="checkbox" ${task.completed ? "checked" : ""}>
                <span class="checkbox-custom"></span>
                <span class="task-text">${task.text}</span>
            `;
            taskContainer.appendChild(taskItem);
        });
        updateTaskCounter();
    }

    // Add a new task and send it to the Python backend
    async function addTask() {
        const taskText = taskInput.value.trim();
        if (!taskText) return;

        const newTask = {
            id: Date.now(), // Unique integer ID based on timestamp
            text: taskText,
            completed: false
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTask)
            });

            if (response.ok) {
                taskInput.value = "";
                fetchTasks(); // Reload task list from backend
            }
        } catch (error) {
            console.error("Error saving task:", error);
        }
    }

    // Event listeners for adding tasks
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

    // Event delegation for checking/unchecking tasks & updating backend
    if (taskContainer) {
        taskContainer.addEventListener("change", async (e) => {
            if (e.target.type === "checkbox") {
                const taskItem = e.target.closest(".task-item");
                const taskId = parseInt(taskItem.dataset.id);
                const taskText = taskItem.querySelector(".task-text").textContent;
                const isCompleted = e.target.checked;

                // Toggle visual class immediately
                if (isCompleted) {
                    taskItem.classList.add("completed");
                } else {
                    taskItem.classList.remove("completed");
                }
                updateTaskCounter();

                // Send updated status back to FastAPI / SQLite
                try {
                    await fetch(`${API_BASE_URL}/api/tasks`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            id: taskId,
                            text: taskText,
                            completed: isCompleted
                        })
                    });
                } catch (error) {
                    console.error("Error updating task status:", error);
                }
            }
        });
    }

    function updateTaskCounter() {
        if (!progressBadge) return;
        const totalTasks = taskContainer.querySelectorAll(".task-item").length;
        const completedTasks = taskContainer.querySelectorAll(".task-item.completed").length;
        progressBadge.textContent = `${completedTasks}/${totalTasks}`;
    }

    // Load tasks on initial page load
    fetchTasks();


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
    const pauseBtn = secondaryCtrlBtns[0]; 
    const resetBtn = secondaryCtrlBtns[1]; 
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

    updateTimerDisplay();
});