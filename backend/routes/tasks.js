const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Валидация заголовка задачи
function validateTitle(title) {
  if (!title || typeof title !== 'string') {
    return { valid: false, message: 'Название задачи обязательно' };
  }
  
  const trimmedTitle = title.trim();
  if (trimmedTitle.length === 0) {
    return { valid: false, message: 'Название задачи не может быть пустым' };
  }
  
  if (trimmedTitle.length > 500) {
    return { valid: false, message: 'Название задачи слишком длинное (максимум 500 символов)' };
  }
  
  return { valid: true, title: trimmedTitle };
}

// GET /api/tasks - Получить все задачи
router.get('/', async (req, res) => {
  try {
    const tasks = await db.getAllTasks();
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Ошибка получения задач:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения задач'
    });
  }
});

// GET /api/tasks/:id - Получить задачу по ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Неверный ID задачи'
      });
    }

    const task = await db.getTaskById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Задача не найдена'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Ошибка получения задачи:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения задачи'
    });
  }
});

// POST /api/tasks - Создать новую задачу
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    
    const validation = validateTitle(title);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    const task = await db.createTask(validation.title);
    res.status(201).json({
      success: true,
      data: task,
      message: 'Задача успешно создана'
    });
  } catch (error) {
    console.error('Ошибка создания задачи:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка создания задачи'
    });
  }
});

// PUT /api/tasks/:id - Обновить задачу
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Неверный ID задачи'
      });
    }

    const { title, completed } = req.body;
    
    const validation = validateTitle(title);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    if (typeof completed !== 'number' && typeof completed !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Неверное значение статуса задачи'
      });
    }

    const task = await db.updateTask(id, validation.title, completed ? 1 : 0);
    res.json({
      success: true,
      data: task,
      message: 'Задача успешно обновлена'
    });
  } catch (error) {
    console.error('Ошибка обновления задачи:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка обновления задачи'
    });
  }
});

// PATCH /api/tasks/:id/toggle - Переключить статус задачи
router.patch('/:id/toggle', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Неверный ID задачи'
      });
    }

    await db.toggleTask(id);
    const task = await db.getTaskById(id);
    
    res.json({
      success: true,
      data: task,
      message: 'Статус задачи изменён'
    });
  } catch (error) {
    console.error('Ошибка изменения статуса задачи:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка изменения статуса задачи'
    });
  }
});

// DELETE /api/tasks/:id - Удалить задачу
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Неверный ID задачи'
      });
    }

    await db.deleteTask(id);
    res.json({
      success: true,
      message: 'Задача успешно удалена'
    });
  } catch (error) {
    console.error('Ошибка удаления задачи:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка удаления задачи'
    });
  }
});

module.exports = router;
