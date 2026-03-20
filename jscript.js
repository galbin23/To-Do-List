let todos = [];
let currentFilter = 'all';
let currentTagFilter = 'all';

const todoForm = document.getElementById('todo-form');
const taskInput = document.getElementById('task-input');
const tagSelect = document.getElementById('tag-select');
const errorDiv = document.getElementById('error');
const todoList = document.getElementById('todo-list');
const activeCount = document.getElementById('active-count');
const filterButtons = document.querySelectorAll('.filter-btn');
const tagFilterSelect = document.getElementById('tag-filter');

function loadTodos() {
  const stored = localStorage.getItem('todos');
  if (stored) {
    todos = JSON.parse(stored);
  }
  render();
  updateTagFilterOptions();
}

function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function generateId() {
  return Date.now() + Math.random();
}

function addTask(text, tag = '') {
  if (!text.trim()) {
    errorDiv.classList.remove('hidden');
    return false;
  }
  errorDiv.classList.add('hidden');

  const newTask = {
    id: generateId(),
    text: text.trim(),
    tag: tag.trim() || null,
    done: false
  };

  todos.push(newTask);
  saveTodos();
  render();
  updateTagFilterOptions();
  return true;
}

function toggleDone(id) {
  todos = todos.map(todo =>
    todo.id === id ? { ...todo, done: !todo.done } : todo
  );
  saveTodos();
  render();
}

function deleteTask(id) {
  todos = todos.filter(todo => todo.id !== id);
  saveTodos();
  render();
  updateTagFilterOptions();
}

function getFilteredTodos() {
  let filtered = todos;

  if (currentFilter === 'active') {
    filtered = filtered.filter(t => !t.done);
  } else if (currentFilter === 'completed') {
    filtered = filtered.filter(t => t.done);
  }

  if (currentTagFilter !== 'all') {
    filtered = filtered.filter(t => t.tag === currentTagFilter);
  }

  return filtered;
}

function updateActiveCount() {
  const active = todos.filter(t => !t.done).length;
  activeCount.textContent = `${active} active task${active !== 1 ? 's' : ''}`;
}

function render() {
  todoList.innerHTML = '';

  const filtered = getFilteredTodos();

  filtered.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = todo.id;

    li.innerHTML = `
      <input 
        type="checkbox" 
        ${todo.done ? 'checked' : ''} 
        class="toggle-btn"
        onchange="toggleDone(${todo.id})"
      >
      <span class="todo-text ${todo.done ? 'done' : ''}">${todo.text}</span>
      ${todo.tag ? `<span class="tag">${todo.tag}</span>` : ''}
      <div class="actions">
        <button class="delete-btn" onclick="deleteTask(${todo.id})">×</button>
      </div>
    `;

    todoList.appendChild(li);
  });

  updateActiveCount();
  updateActiveFilterButton();
}

function updateActiveFilterButton() {
  filterButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === currentFilter);
  });
}

function updateTagFilterOptions() {
  tagFilterSelect.innerHTML = '<option value="all">All tags</option>';

  const uniqueTags = [...new Set(
    todos
      .filter(t => t.tag)
      .map(t => t.tag)
  )].sort();

  uniqueTags.forEach(tag => {
    const opt = document.createElement('option');
    opt.value = tag;
    opt.textContent = tag;
    tagFilterSelect.appendChild(opt);
  });

  if (!uniqueTags.includes(currentTagFilter) && currentTagFilter !== 'all') {
    currentTagFilter = 'all';
    tagFilterSelect.value = 'all';
  } else {
    tagFilterSelect.value = currentTagFilter;
  }
}

todoForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = taskInput.value;
  const tag = tagSelect.value;

  if (addTask(text, tag)) {
    taskInput.value = '';
    tagSelect.value = '';
  }
  taskInput.focus();
});

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    render();
  });
});

tagFilterSelect.addEventListener('change', e => {
  currentTagFilter = e.target.value;
  render();
});

loadTodos();
