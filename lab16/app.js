const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');

const app = express();
app.disable('x-powered-by');
app.use(bodyParser.json({ limit: '16kb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '16kb' }));
app.use(routes);
app.use((request, response) => response.status(404).json({ error: 'Маршрут не знайдено.' }));
app.use((error, request, response, next) => {
    const status = [400, 413, 415].includes(error.status) ? error.status : 500;
    response.status(status).json({ error: status === 413 ? 'Завеликий запит.' : status === 400 || status === 415 ? 'Некоректне тіло або формат запиту.' : 'Помилка сервера.' });
});

if (require.main === module) {
    const port = Number(process.env.PORT || 3002);
    const server = app.listen(port, '127.0.0.1', () => console.log(`Express: http://127.0.0.1:${port}`));
    server.on('error', error => {
        console.error(error.code === 'EADDRINUSE' ? `Порт ${port} уже зайнятий.` : 'Не вдалося запустити Express-сервер.');
        process.exitCode = 1;
    });
}

module.exports = app;
