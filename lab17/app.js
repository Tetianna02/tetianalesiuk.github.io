const path = require('node:path');
const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./data/config');
const routes = require('./routes');

const app = express();
app.disable('x-powered-by');
app.use(bodyParser.json({ limit: '16kb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '16kb' }));
app.get(['/', '/index.html'], (request, response) => response.sendFile(path.join(__dirname, 'index.html')));
app.get('/style.css', (request, response) => response.sendFile(path.join(__dirname, 'style.css')));
app.get('/script.js', (request, response) => response.sendFile(path.join(__dirname, 'script.js')));
app.get('/api', (request, response) => response.json({ message: 'Node.js and Express REST API', resource: '/phones' }));
app.use(routes);
app.use((request, response) => response.status(404).json({ error: 'Маршрут не знайдено.' }));
app.use((error, request, response, next) => {
    if (error.code === 'ER_DUP_ENTRY') {
        response.status(409).json({ error: 'Телефон із такою моделлю, виробником і пам’яттю вже існує.' });
    } else if (['ER_CHECK_CONSTRAINT_VIOLATED', 'ER_BAD_NULL_ERROR', 'ER_DATA_TOO_LONG', 'ER_WARN_DATA_OUT_OF_RANGE', 'WARN_DATA_TRUNCATED'].includes(error.code)) {
        response.status(400).json({ error: 'Дані не відповідають обмеженням таблиці phones.' });
    } else if (error.status === 400 || error.status === 413 || error.status === 415) {
        response.status(error.status).json({ error: error.status === 413 ? 'Завеликий запит.' : 'Некоректне тіло або формат запиту.' });
    } else if (['ECONNREFUSED', 'ECONNRESET', 'EPIPE', 'ENOTFOUND', 'EHOSTUNREACH', 'ETIMEDOUT', 'ER_ACCESS_DENIED_ERROR', 'ER_NOT_SUPPORTED_AUTH_MODE', 'ER_BAD_DB_ERROR', 'ER_NO_SUCH_TABLE', 'ER_CON_COUNT_ERROR', 'PROTOCOL_CONNECTION_LOST', 'PROTOCOL_SEQUENCE_TIMEOUT', 'POOL_ENQUEUELIMIT'].includes(error.code)) {
        response.status(503).json({ error: 'База даних недоступна. Перевірте запуск MySQL, schema.sql і параметри .env.' });
    } else {
        console.error('Помилка API:', error.code || error.name);
        response.status(500).json({ error: 'Не вдалося виконати операцію на сервері.' });
    }
});

if (require.main === module) {
    const port = Number(process.env.PORT || 3003);
    const host = process.env.HOST || '127.0.0.1';
    const server = app.listen(port, host, () => console.log(`Каталог: http://${host}:${port}`));
    server.on('error', error => {
        console.error(error.code === 'EADDRINUSE' ? `Порт ${port} уже зайнятий.` : 'Не вдалося запустити сервер.');
        pool.end();
        process.exitCode = 1;
    });
    const shutdown = () => server.close(() => pool.end(() => process.exit(0)));
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
}

module.exports = app;
