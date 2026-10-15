const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'tasks.db');

class Database {
  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Ошибка подключения к базе данных:', err.message);
      } else {
        console.log('Подключено к базе данных SQLite');
      }
    });
  }

  // Получить все задачи
  getAllTasks() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM tasks ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Получить задачу по ID
  getTaskById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Создать новую задачу
  createTask(title) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO tasks (title) VALUES (?)',
        [title],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, title, completed: 0 });
          }
        }
      );
    });
  }

  // Обновить задачу
  updateTask(id, title, completed) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE tasks SET title = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, completed, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, title, completed });
          }
        }
      );
    });
  }

  // Переключить статус задачи
  toggleTask(id) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE tasks SET completed = NOT completed, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id });
          }
        }
      );
    });
  }

  // Удалить задачу
  deleteTask(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id });
        }
      });
    });
  }

  // Закрыть соединение
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = new Database();
