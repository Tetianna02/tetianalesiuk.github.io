const express = require('express');
const router = express.Router();

const users = [
    { id: 1, name: 'Тетяна', email: 'tetiana@example.com' },
    { id: 2, name: 'Одногрупник', email: 'friend@example.com' }
];

router.get('/', (request, response) => {
    response.json({ message: 'Node.js and Express REST API' });
});

router.get('/users', (request, response) => {
    response.json(users);
});

module.exports = router;
