const http = require('node:http');

const server = http.createServer((request, response) => {
    console.log(`${request.method} ${request.url}`);
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        response.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8', Allow: 'GET, HEAD' });
        response.end('Method not allowed');
        return;
    }
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(request.method === 'HEAD' ? '' : 'Hello, server!');
});

if (require.main === module) {
    const port = Number(process.env.PORT || 3001);
    server.on('error', error => {
        console.error(error.code === 'EADDRINUSE' ? `Порт ${port} уже зайнятий.` : 'Не вдалося запустити HTTP-сервер.');
        process.exitCode = 1;
    });
    server.listen(port, '127.0.0.1', () => console.log(`HTTP: http://127.0.0.1:${port}`));
}

module.exports = server;
