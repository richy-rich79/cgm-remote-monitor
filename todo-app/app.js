(() => {
  const STORAGE_KEY = 'todo-app:v1';

  /** @type {HTMLFormElement} */
  const form = document.getElementById('todo-form');
  /** @type {HTMLInputElement} */
  const input = document.getElementById('todo-input');
  /** @type {HTMLUListElement} */
  const list = document.getElementById('todo-list');
  /** @type {HTMLSpanElement} */
  const itemsLeft = document.getElementById('items-left');
  /** @type {HTMLElement} */
  const srLive = document.getElementById('sr-live');

  const filterButtons = Array.from(document.querySelectorAll('.filters button'));
  const clearCompletedButton = document.getElementById('clear-completed');
  const template = document.getElementById('todo-item-template');

  /**
   * @typedef {{ id: string, title: string, completed: boolean, createdAt: number }} Todo
   */

  /** @type {Todo[]} */
  let todos = load();
  /** @type {'all' | 'active' | 'completed'} */
  let currentFilter = 'all';

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Failed to parse storage, starting fresh.');
      return [];
    }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function announce(message) {
    srLive.textContent = '';
    // ensure change is detected by assistive tech
    setTimeout(() => (srLive.textContent = message), 0);
  }

  function createId() {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  function render() {
    list.innerHTML = '';
    const filtered = todos.filter(t => {
      if (currentFilter === 'active') return !t.completed;
      if (currentFilter === 'completed') return t.completed;
      return true;
    });

    for (const todo of filtered) {
      const clone = /** @type {HTMLLIElement} */ (template.content.firstElementChild.cloneNode(true));
      const checkbox = /** @type {HTMLInputElement} */ (clone.querySelector('.toggle'));
      const titleSpan = clone.querySelector('.title');
      const editButton = clone.querySelector('.edit');
      const deleteButton = clone.querySelector('.delete');

      clone.dataset.id = todo.id;
      titleSpan.textContent = todo.title;
      checkbox.checked = todo.completed;
      clone.classList.toggle('completed', todo.completed);

      checkbox.addEventListener('change', () => {
        todo.completed = checkbox.checked;
        persist();
        render();
        updateCount();
        announce(todo.completed ? 'Task completed' : 'Task reactivated');
      });

      deleteButton.addEventListener('click', () => {
        todos = todos.filter(t => t.id !== todo.id);
        persist();
        render();
        updateCount();
        announce('Task deleted');
      });

      editButton.addEventListener('click', () => startEdit(clone, todo));

      list.appendChild(clone);
    }

    itemsLeft.textContent = `${todos.filter(t => !t.completed).length} items left`;
  }

  function startEdit(listItem, todo) {
    const titleSpan = listItem.querySelector('.title');
    const actions = listItem.querySelector('.item-actions');
    const label = listItem.querySelector('label');

    const input = document.createElement('input');
    input.type = 'text';
    input.value = todo.title;
    input.setAttribute('aria-label', 'Edit task title');
    input.className = 'edit-input';

    titleSpan.replaceWith(input);
    actions.style.display = 'none';
    input.focus();

    function finish(commit) {
      if (commit) {
        const newTitle = input.value.trim();
        if (newTitle.length > 0) {
          todo.title = newTitle;
          persist();
          announce('Task updated');
        }
      }
      render();
      updateCount();
      // Try to restore focus to the checkbox for the same item
      const restored = list.querySelector(`[data-id="${todo.id}"] .toggle`);
      if (restored) restored.focus();
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') finish(true);
      if (e.key === 'Escape') finish(false);
    });
    input.addEventListener('blur', () => finish(true));
  }

  function updateCount() {
    itemsLeft.textContent = `${todos.filter(t => !t.completed).length} items left`;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = input.value.trim();
    if (!title) return;
    todos.unshift({ id: createId(), title, completed: false, createdAt: Date.now() });
    input.value = '';
    persist();
    render();
    updateCount();
    announce('Task added');
  });

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      currentFilter = /** @type any */ (btn.dataset.filter);
      render();
    });
  });

  clearCompletedButton.addEventListener('click', () => {
    const hadCompleted = todos.some(t => t.completed);
    todos = todos.filter(t => !t.completed);
    persist();
    render();
    updateCount();
    if (hadCompleted) announce('Cleared completed tasks');
  });

  // initial render
  render();
  updateCount();
})();

