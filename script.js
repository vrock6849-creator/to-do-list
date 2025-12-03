
// script.js - Step 3 (state + storage + render skeleton)

// 1) Storage key - where we'll save tasks in browser storage
const STORAGE_KEY = "todo_v1";

// 2) In-memory state: an array of task objects
let tasks = [];

// 3) DOM references: elements we will manipulate
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("list");

// 4) Small helper to create a short unique id for each task
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// 5) Load tasks from localStorage into `tasks` (if any)
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
  } catch (e) {
    tasks = [];
  }
  render(); // after loading, draw the UI
}

// 6) Save current `tasks` array to localStorage
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// 7) Render function: draw `tasks` into the DOM
function render() {
  // 7.1 clear existing list
  list.innerHTML = "";

  // 7.2 if no tasks, show friendly message
  if (tasks.length === 0) {
    const p = document.createElement("p");
    p.style.color = "#64748b";
    p.textContent = "No tasks yet — add your first task!";
    list.appendChild(p);
    return;
  }

  // 7.3 otherwise, build each task element
  tasks.forEach((task) => {
    const item = document.createElement("div");       // container
    item.className = "task-item";
    item.dataset.id = task.id;

    const left = document.createElement("div");       // left side (checkbox + text)
    left.className = "task-left";

    const checkboxWrap = document.createElement("label");
    checkboxWrap.className = "task-checkbox";

    const checkbox = document.createElement("input"); // checkbox input
    checkbox.type = "checkbox";
    checkbox.checked = task.done || false;

    const text = document.createElement("div");      // task text
    text.className = "task-text" + (task.done ? " completed" : "");
    text.textContent = task.text;

    // assemble left
    checkboxWrap.appendChild(checkbox);
    left.appendChild(checkboxWrap);
    left.appendChild(text);

    // right side (delete button)
    const right = document.createElement("div");
    right.className = "task-right";

    const trash = document.createElement("button");
    trash.className = "trash-btn";
    trash.title = "Delete";
    trash.innerHTML = "🗑";

    right.appendChild(trash);

    // assemble item
    item.appendChild(left);
    item.appendChild(right);

    // add to DOM
    list.appendChild(item);
  });
}

// 8) Initialize app by loading saved tasks and rendering
load();
// 9) createTask: add a new task to state and persist
function addTask(text) {
  const newTask = {
    id: uid(),
    text: text.trim(),
    done: false
  };
  tasks.unshift(newTask); // newest at the top
  save();
  render();
}

// 10) wire Add button
addBtn.addEventListener("click", () => {
  const val = taskInput.value.trim();
  if (!val) {
    taskInput.focus();
    return;
  }
  addTask(val);
  taskInput.value = "";
});

// 11) allow Enter key to add task
taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addBtn.click();
  }
});
// 12) helper actions: delete & toggle complete
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id); // remove task with matching id
  save();
  render();
}

function toggleTask(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  t.done = !t.done; // flip the boolean
  save();
  render();
}

// 13) event delegation: listen on the list container for clicks/changes
list.addEventListener('click', (e) => {
  const btn = e.target;
  // if click was on delete button (or inside it)
  if (btn.closest && btn.closest('.trash-btn')) {
    const item = btn.closest('.task-item');
    if (!item) return;
    const id = item.dataset.id;
    deleteTask(id);
    return;
  }
});

list.addEventListener('change', (e) => {
  // handle checkbox change (toggle completion)
  const target = e.target;
  if (target && target.type === 'checkbox') {
    const item = target.closest('.task-item');
    if (!item) return;
    const id = item.dataset.id;
    toggleTask(id);
  }
});
// ----- Step 6: counts, click-to-toggle-on-text, and edit-on-dblclick -----

// create a counts element (if not already present) and insert it above the list
let countsEl = document.getElementById('counts');
if (!countsEl) {
  countsEl = document.createElement('div');
  countsEl.id = 'counts';
  countsEl.style.color = '#52606a';
  countsEl.style.marginTop = '10px';
  countsEl.style.fontSize = '14px';
  // insert counts before the list in the DOM
  list.parentNode.insertBefore(countsEl, list);
}

// updateCounts: compute totals and display them
function updateCounts() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.done).length;
  countsEl.textContent = `Total: ${total} • Completed: ${completed}`;
}

// editTask: simple edit using prompt (keeps code short)
function editTask(id, newTitle) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  t.text = newTitle.trim();
  save();
  render();
}

// Enhance the click listener: if user clicks the task text, toggle it.
// (We already have a click listener for delete; extend that logic.)
list.addEventListener('click', (e) => {
  const target = e.target;

  // 1) If click on delete button (existing logic) — find closest .trash-btn
  if (target.closest && target.closest('.trash-btn')) {
    const item = target.closest('.task-item');
    if (!item) return;
    const id = item.dataset.id;
    deleteTask(id);
    return;
  }

  // 2) If click on the task text, toggle done
  if (target.classList && target.classList.contains('task-text')) {
    const item = target.closest('.task-item');
    if (!item) return;
    const id = item.dataset.id;
    toggleTask(id);
    return;
  }
});

// Double-click on the task text -> edit (simple prompt)
list.addEventListener('dblclick', (e) => {
  const target = e.target;
  if (target.classList && target.classList.contains('task-text')) {
    const item = target.closest('.task-item');
    if (!item) return;
    const id = item.dataset.id;
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newTitle = prompt('Edit task title:', task.text);
    if (newTitle === null) return; // user cancelled
    if (newTitle.trim() === '') return; // ignore empty edits
    editTask(id, newTitle);
  }
});

// Finally, call updateCounts() at the end of render() so counts always refresh.
// To ensure that, we'll wrap the existing render by saving a reference then redefining render
// (This is safe and simple for this small app.)
const _oldRender = render;
render = function() {
  _oldRender();     // call the previous render implementation which updates the list
  updateCounts();   // then update counts bar
};
// INLINE EDIT (replace previous editTask + dblclick logic)

// helper: start inline edit on a task element
function startInlineEdit(item) {
  const id = item.dataset.id;
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  // locate the text node element
  const textEl = item.querySelector('.task-text');
  if (!textEl) return;

  // create input and prefill with current text
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'inline-edit';
  input.value = task.text;
  input.style.padding = '8px';
  input.style.fontSize = '16px';
  input.style.borderRadius = '8px';
  input.style.border = '1px solid #d1e6ff';
  input.style.width = '100%';
  input.style.boxSizing = 'border-box';

  // replace textEl with input
  textEl.replaceWith(input);
  input.focus();
  // move caret to end
  input.setSelectionRange(input.value.length, input.value.length);

  // helper to finish edit
  function finish(saveChanges) {
    if (saveChanges) {
      const newVal = input.value.trim();
      if (newVal) {
        task.text = newVal;
        save();
      }
    }
    // restore original text element (with updated text if saved)
    const newText = document.createElement('div');
    newText.className = 'task-text' + (task.done ? ' completed' : '');
    newText.textContent = task.text;
    input.replaceWith(newText);
    // re-run render to ensure event wiring + counts etc.
    render();
  }

  // keyboard handling: Enter = save, Escape = cancel
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      finish(true);
    } else if (e.key === 'Escape') {
      finish(false);
    }
  });

  // blur -> save (common UX)
  input.addEventListener('blur', () => finish(true));
}

// attach dblclick to start inline edit (delegated)
list.addEventListener('dblclick', (e) => {
  const target = e.target;
  if (target.classList && target.classList.contains('task-text')) {
    const item = target.closest('.task-item');
    if (!item) return;
    startInlineEdit(item);
  }
});
