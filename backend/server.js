const express = require('express');
const cors = require('cors');
const path = require('path');
const tasksRouter = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Раздача статических файлов из папки frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// API маршруты
app.use('/api/tasks', tasksRouter);

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Обработка несуществующих маршрутов
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Маршрут не найден'
  });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({
    success: false,
    message: 'Внутренняя ошибка сервера'
  });
});

// Запуск сервера
const server = app.listen(PORT, () => {
  console.log(`\n✓ Сервер запущен на http://localhost:${PORT}`);
  console.log(`✓ API доступен на http://localhost:${PORT}/api/tasks`);
  console.log(`✓ Нажмите Ctrl+C для остановки\n`);
});

// Обработка ошибки занятого порта
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ Ошибка: Порт ${PORT} уже используется`);
    console.error(`\nДля освобождения порта выполните:\n`);
    console.error(`Windows: netstat -ano | findstr :${PORT}`);
    console.error(`         taskkill /F /PID <номер_процесса>\n`);
    console.error(`Или измените порт в файле .env:\n`);
    console.error(`PORT=3001\n`);
    process.exit(1);
  } else {
    console.error('Ошибка запуска сервера:', error);
    process.exit(1);
  }
});

// Обработка graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM получен. Закрытие сервера...');
  server.close(() => {
    console.log('Сервер остановлен');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT получен. Закрытие сервера...');
  server.close(() => {
    console.log('Сервер остановлен');
    process.exit(0);
  });
});
