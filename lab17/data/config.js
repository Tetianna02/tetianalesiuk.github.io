const path = require('node:path');
const mysql = require('mysql');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'lab17_user',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lab17_phones',
    connectionLimit: 5,
    queueLimit: 20,
    connectTimeout: 10000,
    acquireTimeout: 10000,
    charset: 'UTF8MB4_UNICODE_CI',
    multipleStatements: false,
    localInfile: false
});

pool.on('connection', connection => {
    connection.query("SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'", error => {
        if (error) {
            connection.destroy();
        }
    });
});

module.exports = pool;
