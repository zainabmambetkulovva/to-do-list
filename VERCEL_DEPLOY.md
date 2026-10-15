# 🚀 Деплой Task Manager на Vercel

## ✨ Что изменилось для Vercel

Создана **статическая версия** приложения с использованием **localStorage** вместо базы данных, так как Vercel не поддерживает постоянное файловое хранилище для SQLite.

### Файлы для Vercel:
- `public/index.html` - главная страница
- `public/style.css` - стили (скопированы из frontend/)
- `public/script.js` - JavaScript с localStorage
- `vercel.json` - конфигурация Vercel

## 📝 Инструкция по деплою

### Вариант 1: Через Vercel Dashboard (рекомендуется)

1. **Зайдите на Vercel:**
   - Перейдите на https://vercel.com
   - Войдите через GitHub

2. **Импортируйте репозиторий:**
   - Нажмите "Add New Project"
   - Выберите репозиторий `to-do-list`
   - Нажмите "Import"

3. **Настройте проект:**
   ```
   Framework Preset: Other
   Root Directory: ./
   Build Command: (оставьте пустым)
   Output Directory: public
   Install Command: npm install (или оставьте пустым)
   ```

4. **Деплой:**
   - Нажмите "Deploy"
   - Дождитесь завершения
   - Откройте сайт по ссылке

### Вариант 2: Через Vercel CLI

```bash
# Установите Vercel CLI
npm install -g vercel

# Войдите в аккаунт
vercel login

# Деплой
vercel

# Или сразу в production
vercel --prod
```

## 🔄 Разница между версиями

### Локальная версия (с backend):
- ✅ Express сервер
- ✅ SQLite база данных
- ✅ REST API
- ✅ Данные сохраняются на сервере
- ✅ Можно использовать несколько пользователей

**Запуск локально:**
```bash
npm install
npm run init-db
npm start
# http://localhost:3000
```

### Vercel версия (статическая):
- ✅ Только frontend
- ✅ localStorage (данные в браузере)
- ✅ Работает без backend
- ⚠️ Данные только в вашем браузере
- ⚠️ При очистке кеша браузера данные удаляются

**Доступ:**
```
https://ваш-проект.vercel.app
```

## 🔧 Структура для Vercel

```
to-do-list/
├── public/              ← Статическая версия для Vercel
│   ├── index.html
│   ├── style.css
│   └── script.js
├── frontend/            ← Оригинальный frontend (для локальной работы)
├── backend/             ← Backend (не используется на Vercel)
├── vercel.json          ← Конфигурация Vercel
└── package.json
```

## ⚙️ Настройка vercel.json

Файл `vercel.json` настроен для раздачи статических файлов из папки `public/`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

## 🐛 Решение проблем

### 404 ошибка на Vercel

Если видите "404 NOT_FOUND":
1. Проверьте, что папка `public/` есть в репозитории
2. Убедитесь, что `vercel.json` в корне проекта
3. В настройках Vercel установите Output Directory: `public`

### Задачи не сохраняются

Это нормально для статической версии! Данные хранятся в localStorage браузера:
- Они привязаны к вашему браузеру и устройству
- При очистке кеша/cookies данные удалятся
- На другом устройстве будут другие задачи

### Нужна версия с реальной БД

Для полноценного backend с базой данных используйте:
- **Railway** - https://railway.app
- **Render** - https://render.com
- **Fly.io** - https://fly.io
- **Heroku** - https://heroku.com (платно)

Все эти платформы поддерживают Node.js + SQLite/PostgreSQL.

## 🚀 Автоматические деплои

После подключения к Vercel, каждый push в ветку `main` будет автоматически деплоиться:

```bash
git add .
git commit -m "update: добавил новую функцию"
git push origin main
# Vercel автоматически деплоит изменения!
```

## 📱 Тестирование

После деплоя на Vercel:
1. Откройте ссылку от Vercel
2. Попробуйте добавить задачу
3. Обновите страницу - задачи должны остаться
4. Откройте в режиме инкогнито - задач не будет (новый localStorage)

---

**Готово! Ваш Task Manager теперь доступен онлайн на Vercel! 🎉**
