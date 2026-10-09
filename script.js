const taskList = document.getElementById("taskList");
const taskDialog = document.getElementById("taskDialog");
const taskForm = document.getElementById("taskForm");

const taskTitle = document.getElementById("taskTitle");
const taskCategory = document.getElementById("taskCategory");
const taskDay = document.getElementById("taskDay");
const taskDuration = document.getElementById("taskDuration");

let selectedDay = "All";
let editingTaskId = null;

const defaultTasks = [
  { id: 1, title: "Solve Two Sum problem", category: "DSA", day: "Monday", duration: 30, completed: true },
  { id: 2, title: "Practice JavaScript closures", category: "Frontend", day: "Monday", duration: 45, completed: false },
  { id: 3, title: "Solve Remove Duplicates", category: "DSA", day: "Tuesday", duration: 30, completed: false },
  { id: 4, title: "Revise Git and GitHub", category: "Git & GitHub", day: "Wednesday", duration: 40, completed: false },
  { id: 5, title: "Build a responsive component", category: "Frontend", day: "Thursday", duration: 60, completed: false },
  { id: 6, title: "Practice mock interview questions", category: "Mock Interview", day: "Friday", duration: 45, completed: false },
  { id: 7, title: "Revise Express and REST APIs", category: "Backend", day: "Saturday", duration: 60, completed: false }
];

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem("prepTrackTasks");
    return savedTasks ? JSON.parse(savedTasks) : defaultTasks;
  } catch (error) {
    console.error("Error loading tasks:", error);
    return defaultTasks;
  }
}

let tasks = loadTasks();

function saveTasks() {
  try {
    localStorage.setItem("prepTrackTasks", JSON.stringify(tasks));
  } catch (error) {
    console.error("Error saving tasks:", error);
    alert("Could not save tasks in this browser.");
  }
}

function escapeHTML(value) {
  const entities = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };

  return String(value).replace(/[&<>"']/g, character => entities[character]);
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const pending = total - completed;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById("totalTasks").textContent = total;
  document.getElementById("completedTasks").textContent = completed;
  document.getElementById("pendingTasks").textContent = pending;
  document.getElementById("completionRate").textContent = percentage + "%";
  document.getElementById("progressText").textContent = percentage + "% completed";
  document.getElementById("progressBar").style.width = percentage + "%";
}

function renderTasks() {
  const category = document.getElementById("categoryFilter").value;

  const filteredTasks = tasks.filter(task => {
    const matchesDay = selectedDay === "All" || task.day === selectedDay;
    const matchesCategory = category === "All" || task.category === category;

    return matchesDay && matchesCategory;
  });

  if (filteredTasks.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <h3>No tasks found</h3>
        <p>Add a new task or change your filters.</p>
      </div>
    `;

    updateStats();
    return;
  }

  taskList.innerHTML = filteredTasks.map(task => `
    <article class="task-card ${task.completed ? "done" : ""}">
      <button
        class="check-btn"
        data-action="toggle"
        data-id="${task.id}"
        aria-label="${task.completed ? "Mark incomplete" : "Mark complete"}"
        title="Toggle completion"
      >${task.completed ? "✓" : ""}</button>

      <div class="task-info">
        <div class="task-title">${escapeHTML(task.title)}</div>

        <div class="task-meta">
          <span class="category-tag">${escapeHTML(task.category)}</span>
          <span> ${escapeHTML(task.day)}</span>
          <span> ${task.duration} min</span>
        </div>
      </div>

      <div class="task-actions">
        <button class="small-btn" data-action="edit" data-id="${task.id}">Edit</button>
        <button class="small-btn delete-btn" data-action="delete" data-id="${task.id}">Delete</button>
      </div>
    </article>
  `).join("");

  updateStats();
}

function openAddDialog() {
  editingTaskId = null;
  taskForm.reset();

  document.getElementById("dialogTitle").textContent = "Add New Task";
  taskDuration.value = 30;

  if (selectedDay !== "All") {
    taskDay.value = selectedDay;
  }

  taskDialog.showModal();
  taskTitle.focus();
}

function openEditDialog(id) {
  const task = tasks.find(item => item.id === id);

  if (!task) return;

  editingTaskId = id;
  taskTitle.value = task.title;
  taskCategory.value = task.category;
  taskDay.value = task.day;
  taskDuration.value = task.duration;

  document.getElementById("dialogTitle").textContent = "Edit Task";

  taskDialog.showModal();
  taskTitle.focus();
}

document.getElementById("addTaskBtn").addEventListener("click", openAddDialog);

document.getElementById("cancelBtn").addEventListener("click", () => {
  taskDialog.close();
});

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const title = taskTitle.value.trim();
  const duration = Number(taskDuration.value);

  if (!title || !Number.isFinite(duration) || duration < 1) {
    alert("Please enter a valid task name and duration.");
    return;
  }

  if (editingTaskId !== null) {
    tasks = tasks.map(task => {
      if (task.id !== editingTaskId) return task;

      return {
        ...task,
        title: title,
        category: taskCategory.value,
        day: taskDay.value,
        duration: duration
      };
    });
  } else {
    tasks.push({
      id: Date.now(),
      title: title,
      category: taskCategory.value,
      day: taskDay.value,
      duration: duration,
      completed: false
    });
  }

  saveTasks();
  renderTasks();
  taskDialog.close();
});

taskList.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "toggle") {
    tasks = tasks.map(task =>
      task.id === id
        ? { ...task, completed: !task.completed }
        : task
    );
  } else if (action === "edit") {
    openEditDialog(id);
    return;
  } else if (action === "delete") {
    const task = tasks.find(item => item.id === id);

    if (!task) return;
    if (!confirm(`Delete "${task.title}"?`)) return;

    tasks = tasks.filter(item => item.id !== id);
  }

  saveTasks();
  renderTasks();
});

document.getElementById("dayFilters").addEventListener("click", event => {
  const button = event.target.closest("button[data-day]");

  if (!button) return;

  selectedDay = button.dataset.day;

  document.querySelectorAll(".day-btn").forEach(dayButton => {
    dayButton.classList.toggle("active", dayButton === button);
  });

  renderTasks();
});

document.getElementById("categoryFilter").addEventListener("change", renderTasks);

const themeBtn = document.getElementById("themeBtn");

function setTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
  themeBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";

  localStorage.setItem("prepTrackDark", String(isDark));
}

themeBtn.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark");
  setTheme(!isDark);
});

const savedTheme = localStorage.getItem("prepTrackDark") === "true";
setTheme(savedTheme);

document.getElementById("todayDate").textContent =
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric"
  });

renderTasks();