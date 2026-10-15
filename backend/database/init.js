const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'tasks.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.message);
    process.exit(1);
  }
  console.log('Подключено к базе данных SQLite');
});

// Создание таблицы задач
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Ошибка создания таблицы:', err.message);
    } else {
      console.log('Таблица tasks создана успешно');
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('Ошибка закрытия базы данных:', err.message);
  } else {
    console.log('База данных инициализирована и закрыта');
  }
});
