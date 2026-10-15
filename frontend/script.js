// Конфигурация API
const API_URL = '/api/tasks';

// Состояние приложения
let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;

// Элементы DOM
const elements = {
    taskInput: document.getElementById('taskInput'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    taskList: document.getElementById('taskList'),
    searchInput: document.getElementById('searchInput'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    formMessage: document.getElementById('formMessage'),
    editMessage: document.getElementById('editMessage'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    emptyState: document.getElementById('emptyState'),
    
    // Статистика
    totalTasks: document.getElementById('totalTasks'),
    completedTasks: document.getElementById('completedTasks'),
    remainingTasks: document.getElementById('remainingTasks'),
    allCount: document.getElementById('allCount'),
    activeCount: document.getElementById('activeCount'),
    completedCount: document.getElementById('completedCount'),
    
    // Модальное окно
    editModal: document.getElementById('editModal'),
    editTaskInput: document.getElementById('editTaskInput'),
    closeModal: document.getElementById('closeModal'),
    cancelEdit: document.getElementById('cancelEdit'),
    saveEdit: document.getElementById('saveEdit')
};

// Инициализация приложения
async function init() {
    setupEventListeners();
    await loadTasks();
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Добавление задачи
    elements.addTaskBtn.addEventListener('click', handleAddTask);
    elements.taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddTask();
        }
    });
    
    // Поиск
    elements.searchInput.addEventListener('input', renderTasks);
    
    // Фильтры
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentFilter = e.target.dataset.filter;
            elements.filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderTasks();
        });
    });
    
    // Модальное окно
    elements.closeModal.addEventListener('click', closeEditModal);
    elements.cancelEdit.addEventListener('click', closeEditModal);
    elements.saveEdit.addEventListener('click', handleSaveEdit);
    elements.editModal.addEventListener('click', (e) => {
        if (e.target === elements.editModal) {
            closeEditModal();
        }
    });
    
    // Enter в поле редактирования
    elements.editTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSaveEdit();
        }
    });
}

// Загрузка задач с сервера
async function loadTasks() {
    try {
        showLoading(true);
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error('Ошибка загрузки задач');
        }
        
        const data = await response.json();
        
        if (data.success) {
            tasks = data.data.map(task => ({
                ...task,
                completed: Boolean(task.completed)
            }));
            renderTasks();
            updateStats();
        } else {
            showMessage(elements.formMessage, data.message || 'Ошибка загрузки задач', 'error');
        }
    } catch (error) {
        console.error('Ошибка загрузки задач:', error);
        showMessage(elements.formMessage, 'Не удалось загрузить задачи. Проверьте подключение к серверу.', 'error');
    } finally {
        showLoading(false);
    }
}

// Добавление новой задачи
async function handleAddTask() {
    const title = elements.taskInput.value.trim();
    
    if (!title) {
        showMessage(elements.formMessage, 'Введите название задачи', 'error');
        return;
    }
    
    if (title.length > 500) {
        showMessage(elements.formMessage, 'Название задачи слишком длинное (максимум 500 символов)', 'error');
        return;
    }
    
    try {
        elements.addTaskBtn.disabled = true;
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title })
        });
        
        const data = await response.json();
        
        if (data.success) {
            tasks.unshift({
                ...data.data,
                completed: Boolean(data.data.completed)
            });
            elements.taskInput.value = '';
            renderTasks();
            updateStats();
            showMessage(elements.formMessage, data.message || 'Задача успешно добавлена', 'success');
        } else {
            showMessage(elements.formMessage, data.message || 'Ошибка добавления задачи', 'error');
        }
    } catch (error) {
        console.error('Ошибка добавления задачи:', error);
        showMessage(elements.formMessage, 'Не удалось добавить задачу', 'error');
    } finally {
        elements.addTaskBtn.disabled = false;
    }
}

// Переключение статуса задачи
async function toggleTask(id) {
    try {
        const response = await fetch(`${API_URL}/${id}/toggle`, {
            method: 'PATCH'
        });
        
        const data = await response.json();
        
        if (data.success) {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.completed = Boolean(data.data.completed);
            }
            renderTasks();
            updateStats();
        } else {
            showMessage(elements.formMessage, data.message || 'Ошибка изменения статуса', 'error');
        }
    } catch (error) {
        console.error('Ошибка переключения задачи:', error);
        showMessage(elements.formMessage, 'Не удалось изменить статус задачи', 'error');
    }
}

// Открытие модального окна редактирования
function openEditModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    editingTaskId = id;
    elements.editTaskInput.value = task.title;
    elements.editModal.classList.add('active');
    elements.editTaskInput.focus();
    hideMessage(elements.editMessage);
}

// Закрытие модального окна
function closeEditModal() {
    elements.editModal.classList.remove('active');
    editingTaskId = null;
    elements.editTaskInput.value = '';
    hideMessage(elements.editMessage);
}

// Сохранение отредактированной задачи
async function handleSaveEdit() {
    const title = elements.editTaskInput.value.trim();
    
    if (!title) {
        showMessage(elements.editMessage, 'Введите название задачи', 'error');
        return;
    }
    
    if (title.length > 500) {
        showMessage(elements.editMessage, 'Название задачи слишком длинное (максимум 500 символов)', 'error');
        return;
    }
    
    const task = tasks.find(t => t.id === editingTaskId);
    if (!task) return;
    
    try {
        elements.saveEdit.disabled = true;
        
        const response = await fetch(`${API_URL}/${editingTaskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                completed: task.completed
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            task.title = title;
            renderTasks();
            closeEditModal();
            showMessage(elements.formMessage, data.message || 'Задача обновлена', 'success');
        } else {
            showMessage(elements.editMessage, data.message || 'Ошибка обновления задачи', 'error');
        }
    } catch (error) {
        console.error('Ошибка редактирования задачи:', error);
        showMessage(elements.editMessage, 'Не удалось обновить задачу', 'error');
    } finally {
        elements.saveEdit.disabled = false;
    }
}

// Удаление задачи
async function deleteTask(id) {
    if (!confirm('Вы уверены, что хотите удалить эту задачу?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            tasks = tasks.filter(t => t.id !== id);
            renderTasks();
            updateStats();
            showMessage(elements.formMessage, data.message || 'Задача удалена', 'success');
        } else {
            showMessage(elements.formMessage, data.message || 'Ошибка удаления задачи', 'error');
        }
    } catch (error) {
        console.error('Ошибка удаления задачи:', error);
        showMessage(elements.formMessage, 'Не удалось удалить задачу', 'error');
    }
}

// Отрисовка списка задач
function renderTasks() {
    const searchQuery = elements.searchInput.value.toLowerCase().trim();
    
    // Фильтрация задач
    let filteredTasks = tasks.filter(task => {
        // Фильтр по статусу
        if (currentFilter === 'active' && task.completed) return false;
        if (currentFilter === 'completed' && !task.completed) return false;
        
        // Поиск
        if (searchQuery && !task.title.toLowerCase().includes(searchQuery)) {
            return false;
        }
        
        return true;
    });
    
    // Отображение пустого состояния
    if (filteredTasks.length === 0) {
        elements.taskList.innerHTML = '';
        elements.emptyState.style.display = 'block';
        
        if (searchQuery) {
            elements.emptyState.querySelector('.empty-state__text').textContent = '🔍 Ничего не найдено';
            elements.emptyState.querySelector('.empty-state__hint').textContent = 'Попробуйте изменить поисковый запрос';
        } else if (currentFilter === 'active') {
            elements.emptyState.querySelector('.empty-state__text').textContent = '✅ Все задачи выполнены';
            elements.emptyState.querySelector('.empty-state__hint').textContent = 'Отличная работа!';
        } else if (currentFilter === 'completed') {
            elements.emptyState.querySelector('.empty-state__text').textContent = '📋 Нет выполненных задач';
            elements.emptyState.querySelector('.empty-state__hint').textContent = 'Начните выполнять задачи';
        } else {
            elements.emptyState.querySelector('.empty-state__text').textContent = '📋 Нет задач';
            elements.emptyState.querySelector('.empty-state__hint').textContent = 'Добавьте свою первую задачу';
        }
        return;
    }
    
    elements.emptyState.style.display = 'none';
    
    // Отрисовка задач
    elements.taskList.innerHTML = filteredTasks.map(task => `
        <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            >
            <span class="task-title">${escapeHtml(task.title)}</span>
            <div class="task-actions">
                <button class="task-btn task-btn--edit" onclick="openEditModal(${task.id})">
                    Изменить
                </button>
                <button class="task-btn task-btn--delete" onclick="deleteTask(${task.id})">
                    Удалить
                </button>
            </div>
        </li>
    `).join('');
}

// Обновление статистики
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const remaining = total - completed;
    const active = remaining;
    
    elements.totalTasks.textContent = total;
    elements.completedTasks.textContent = completed;
    elements.remainingTasks.textContent = remaining;
    
    elements.allCount.textContent = total;
    elements.activeCount.textContent = active;
    elements.completedCount.textContent = completed;
}

// Показать/скрыть индикатор загрузки
function showLoading(show) {
    elements.loadingIndicator.style.display = show ? 'block' : 'none';
}

// Показать сообщение
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `form-message ${type}`;
    element.style.display = 'block';
    
    setTimeout(() => {
        hideMessage(element);
    }, 5000);
}

// Скрыть сообщение
function hideMessage(element) {
    element.style.display = 'none';
    element.className = 'form-message';
}

// Экранирование HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);
