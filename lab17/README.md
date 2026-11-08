# ЛР17 — запуск

Потрібні Node.js 22+ і запущений MySQL Server 8.0.

1. Один раз виконайте `schema.sql` у MySQL Workbench. Потім створіть користувача, замінивши `YOUR_PASSWORD` власним паролем:

```sql
CREATE USER 'lab17_user'@'127.0.0.1'
IDENTIFIED WITH mysql_native_password BY 'YOUR_PASSWORD';
GRANT SELECT, INSERT, UPDATE, DELETE ON lab17_phones.*
TO 'lab17_user'@'127.0.0.1';
```

2. У PowerShell виконайте:

```powershell
cd D:\JS-lab-works\lab17
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm.cmd install
```

3. У файлі `.env` вкажіть пароль створеного користувача в `DB_PASSWORD`. Для цієї конфігурації залиште `DB_USER=lab17_user`, `DB_NAME=lab17_phones`, `DB_HOST=127.0.0.1`, `DB_PORT=3306`.
4. Запустіть сервер:

```powershell
npm.cmd start
```

Відкрити: http://127.0.0.1:3003/.

Надалі достатньо запускати MySQL і виконувати `npm.cmd start` із папки `lab17`. Після видалення `node_modules` спочатку повторіть `npm.cmd install`. Зупинка: Ctrl+C. `.env` і `node_modules` у GitHub не завантажуйте.
