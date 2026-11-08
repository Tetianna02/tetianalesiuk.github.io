const express = require('express');
const pool = require('./data/config');
const router = express.Router();
const FIELDS = 'id, model, brand, memory_gb, price';
const MEMORY_OPTIONS = [32, 64, 128, 256, 512, 1024];

function query(sql, values = []) {
    return new Promise((resolve, reject) => {
        pool.query({ sql, values, timeout: 15000 }, (error, rows) => error ? reject(error) : resolve(rows));
    });
}

function phoneData(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body) ||
        Object.keys(body).some(key => !['model', 'brand', 'memory_gb', 'price'].includes(key)) ||
        typeof body.model !== 'string' || typeof body.brand !== 'string' ||
        !['number', 'string'].includes(typeof body.memory_gb) || !['number', 'string'].includes(typeof body.price)) {
        return null;
    }
    const model = body.model.trim();
    const brand = body.brand.trim();
    const memory = Number(body.memory_gb);
    const price = Number(body.price);
    if (!model || [...model].length > 150 || !brand || [...brand].length > 80 ||
        !/^\d+$/.test(String(body.memory_gb)) || !MEMORY_OPTIONS.includes(memory) ||
        !/^\d+(?:\.\d{1,2})?$/.test(String(body.price)) || !Number.isFinite(price) || price <= 0 || price > 9999999.99) {
        return null;
    }
    return { model, brand, memory_gb: memory, price };
}

function normalize(phone) {
    return { ...phone, price: Number(phone.price) };
}

router.param('id', (request, response, next, value) => {
    if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) > 4294967295) {
        response.status(400).json({ error: 'Ідентифікатор має бути додатним цілим числом.' });
        return;
    }
    request.phoneId = Number(value);
    next();
});

router.get('/phones', async (request, response) => {
    const rows = await query(`SELECT ${FIELDS} FROM phones ORDER BY id DESC`);
    response.json(rows.map(normalize));
});

router.get('/phones/:id', async (request, response) => {
    const rows = await query(`SELECT ${FIELDS} FROM phones WHERE id = ?`, [request.phoneId]);
    if (!rows.length) {
        response.status(404).json({ error: 'Телефон не знайдено.' });
        return;
    }
    response.json(normalize(rows[0]));
});

router.post('/phones', async (request, response) => {
    const phone = phoneData(request.body);
    if (!phone) {
        response.status(400).json({ error: 'Перевірте модель, виробника, обсяг пам’яті та ціну з не більш як двома знаками після крапки.' });
        return;
    }
    const result = await query('INSERT INTO phones (model, brand, memory_gb, price) VALUES (?, ?, ?, ?)', [phone.model, phone.brand, phone.memory_gb, phone.price]);
    response.status(201).location(`/phones/${result.insertId}`).json({ id: result.insertId, ...phone });
});

router.put('/phones/:id', async (request, response) => {
    const phone = phoneData(request.body);
    if (!phone) {
        response.status(400).json({ error: 'Для оновлення передайте коректні model, brand, memory_gb та price.' });
        return;
    }
    await query('UPDATE phones SET model = ?, brand = ?, memory_gb = ?, price = ? WHERE id = ?', [phone.model, phone.brand, phone.memory_gb, phone.price, request.phoneId]);
    const rows = await query(`SELECT ${FIELDS} FROM phones WHERE id = ?`, [request.phoneId]);
    if (!rows.length) {
        response.status(404).json({ error: 'Телефон не знайдено.' });
        return;
    }
    response.json(normalize(rows[0]));
});

router.delete('/phones/:id', async (request, response) => {
    const result = await query('DELETE FROM phones WHERE id = ?', [request.phoneId]);
    if (!result.affectedRows) {
        response.status(404).json({ error: 'Телефон не знайдено.' });
        return;
    }
    response.status(204).end();
});

module.exports = router;
