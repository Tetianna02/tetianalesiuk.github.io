const STORAGE_KEY = 'lab8.todoList';
const SORT_OPTIONS = ['created', 'active', 'completed'];

let tasks = [];
let sortOrder = 'created';

const dateFormatter = new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
});

function showStorageMessage(text) {
    const message = document.getElementById('storageMessage');
    message.textContent = text;
    message.hidden = text === '';
}

function loadTasks() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === null) {
            return;
        }

        const state = JSON.parse(saved);
        if (!state || !Array.isArray(state.tasks)) {
            throw new Error('Некоректні дані');
        }

        const ids = new Set();
        const valid = state.tasks.every(task => {
            if (!task || typeof task.id !== 'string' || task.id === '' || ids.has(task.id)) {
                return false;
            }

            ids.add(task.id);
            return typeof task.text === 'string' &&
                task.text.trim().length > 0 && task.text.length <= 200 &&
                typeof task.completed === 'boolean' &&
                typeof task.createdAt === 'number' &&
                Number.isFinite(new Date(task.createdAt).getTime());
        });

        if (!valid) {
            throw new Error('Некоректні завдання');
        }

        tasks = state.tasks;
        sortOrder = SORT_OPTIONS.includes(state.sortOrder) ? state.sortOrder : 'created';
    } catch {
        showStorageMessage('Не вдалося відновити збережені завдання.');
    }
}

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, sortOrder }));
        showStorageMessage('');
    } catch {
        showStorageMessage('Не вдалося зберегти зміни у браузері. Вони доступні лише до закриття сторінки.');
    }
}

function startEditing(task, textElement) {
    if (!textElement.isConnected) {
        return;
    }

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'task-edit';
    input.value = task.text;
    input.maxLength = 200;
    input.required = true;
    input.setAttribute('aria-label', 'Текст завдання');

    let finished = false;

    function finishEditing(save) {
        if (finished) {
            return;
        }

        const text = input.value.trim();
        if (save && text === '') {
            input.setCustomValidity('Введіть текст завдання.');
            input.reportValidity();
            input.focus();
            return;
        }

        finished = true;
        if (save) {
            task.text = text;
            saveTasks();
        }

        textElement.textContent = task.text;
        input.replaceWith(textElement);
    }

    input.addEventListener('input', () => input.setCustomValidity(''));
    input.addEventListener('keydown', event => {
        if (event.isComposing) {
            return;
        }

        if (event.key === 'Enter' || event.key === 'Escape') {
            event.preventDefault();
            finishEditing(event.key === 'Enter');
            if (finished) {
                textElement.focus();
            }
        }
    });
    input.addEventListener('blur', () => finishEditing(input.value.trim() !== ''));

    textElement.replaceWith(input);
    input.focus();
    input.select();
}

function createTaskItem(task) {
    const item = document.createElement('li');
    item.className = task.completed ? 'task completed' : 'task';

    const status = document.createElement('span');
    status.className = 'task-status';
    if (!task.completed) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.setAttribute('aria-label', 'Позначити завдання виконаним');
        checkbox.addEventListener('change', () => {
            task.completed = true;
            saveTasks();
            renderTasks();
        });
        status.appendChild(checkbox);
    } else {
        status.setAttribute('aria-label', 'Виконано');
    }

    const content = document.createElement('div');
    content.className = 'task-content';

    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;
    text.tabIndex = 0;
    text.setAttribute('role', 'button');
    text.title = 'Редагувати завдання';
    text.addEventListener('dblclick', () => startEditing(task, text));
    text.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === 'F2') {
            event.preventDefault();
            startEditing(task, text);
        }
    });

    const time = document.createElement('time');
    time.dateTime = new Date(task.createdAt).toISOString();
    time.textContent = dateFormatter.format(new Date(task.createdAt));
    content.append(text, time);

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-button';
    deleteButton.textContent = '×';
    deleteButton.setAttribute('aria-label', 'Видалити завдання');
    deleteButton.addEventListener('click', () => {
        tasks = tasks.filter(current => current.id !== task.id);
        saveTasks();
        renderTasks();
    });

    item.append(status, content, deleteButton);
    return item;
}

function renderTasks() {
    const sortedTasks = [...tasks].sort((first, second) => {
        if (sortOrder === 'active' && first.completed !== second.completed) {
            return Number(first.completed) - Number(second.completed);
        }

        if (sortOrder === 'completed' && first.completed !== second.completed) {
            return Number(second.completed) - Number(first.completed);
        }

        return first.createdAt - second.createdAt;
    });

    const list = document.getElementById('taskList');
    list.replaceChildren(...sortedTasks.map(createTaskItem));

    const completedCount = tasks.filter(task => task.completed).length;
    document.getElementById('taskCount').textContent =
        `Усього: ${tasks.length}. Виконано: ${completedCount}. Невиконано: ${tasks.length - completedCount}.`;
    document.getElementById('emptyMessage').hidden = tasks.length !== 0;
}

function init() {
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const taskSort = document.getElementById('taskSort');

    loadTasks();
    taskSort.value = sortOrder;
    renderTasks();

    taskInput.addEventListener('input', () => taskInput.setCustomValidity(''));
    taskForm.addEventListener('submit', event => {
        event.preventDefault();
        const text = taskInput.value.trim();
        if (text === '') {
            taskInput.setCustomValidity('Введіть текст завдання.');
            taskInput.reportValidity();
            return;
        }

        tasks.push({
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            text: text,
            completed: false,
            createdAt: Date.now()
        });
        saveTasks();
        renderTasks();
        taskForm.reset();
        taskInput.focus();
    });

    taskSort.addEventListener('change', () => {
        sortOrder = taskSort.value;
        saveTasks();
        renderTasks();
    });
}

document.addEventListener('DOMContentLoaded', init);
