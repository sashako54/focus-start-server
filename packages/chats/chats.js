const router = require('express').Router();
const db = require('../db/db');
const { validate } = require('jsonschema');

const newChat = users => ({
    chatId: String(
        Math.random()
            .toString(16)
            .split('.')[1]
    ),
    users,
    messages: []
});

// GET /chats
router.get('/', (req, res) => {
    const chats = db.get('chats').value();

    res.json({ status: 'OK', data: chats });
});

// GET /chats/:chatId
router.get('/:chatId', (req, res) => {
    const chat = db
        .get('chats')
        .find({ chatId: req.params.chatId })
        .value();

    res.json({ status: 'OK', data: chat });
});

// POST /chats
router.post('/', (req, res, next) => {
    const chat = newChat(req.body.users);
    console.log(chat);

    db.get('chats')
        .push(chat)
        .write();

    res.json({ status: 'OK', data: chat });
});

// PATCH /chats/:id
router.patch('/:id', (req, res, next) => {
    const chat = db
        .get('chats')
        .find({ id: req.params.id })
        .assign(req.body)
        .value();

    db.write();

    res.json({ status: 'OK', data: chat });
});

// DELETE /chats/:id
router.delete('/:id', (req, res) => {
    db.get('chats')
        .remove({ id: req.params.id })
        .write();

    res.json({ status: 'OK' });
});

module.exports = router;
