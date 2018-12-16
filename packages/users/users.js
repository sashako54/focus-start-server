const router = require('express').Router();
const db = require('../db/db');
const { validate } = require('jsonschema');

const newUser = name => ({
    id: String(
        Math.random()
            .toString(16)
            .split('.')[1]
    ),
    name,
    chats: []
});

// GET /users
router.get('/', (req, res) => {
    console.log('cookie', req.cookies);
    const users = db.get('users').value();

    // users.map(user => delete user.id);

    res.json({ status: 'OK', data: users });
});

// GET /users/:id
router.get('/:id', (req, res) => {
    const user = db
        .get('users')
        .find({ id: req.params.id })
        .value();

    res.json({ status: 'OK', data: user });
});

// POST /users
router.post('/', (req, res, next) => {
    const user = newUser(req.body.name);
    console.log(user);

    // проверка
    const existUser = db
        .get('users')
        .find({ name: req.body.name })
        .value();

    if (existUser) {
        next(new Error('THIS_NICKNAME_ALREADY_EXISTS'));
        res.json({ status: 'FAIL', data: user });
    }

    db.get('users')
        .push(user)
        .write();

    res.json({ status: 'OK', data: user });
});

// PATCH /users/:id
router.patch('/:id', (req, res, next) => {
    const user = db
        .get('users')
        .find({ id: req.params.id })
        .assign(req.body)
        .value();

    db.write();

    res.json({ status: 'OK', data: user });
});

// DELETE /users/:id
router.delete('/:id', (req, res) => {
    db.get('users')
        .remove({ id: req.params.id })
        .write();

    res.json({ status: 'OK' });
});

module.exports = router;
