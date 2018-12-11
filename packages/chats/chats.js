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

const newMessage = (userId, text, usersId) => ({
    id: String(
        Math.random()
            .toString(16)
            .split('.')[1]
    ),
    userId,
    text,
    date: new Date().getTime(),
    isHighlight: usersId.reduce((previousValue, currentValue, index, array) => {
        previousValue[currentValue] = false;
        return previousValue;
    }, {}),
    isVisible: usersId.reduce((previousValue, currentValue, index, array) => {
        previousValue[currentValue] = true;
        return previousValue;
    }, {})
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

// GET /chats/:chatId/messages
router.get('/:chatId/messages', (req, res) => {
    const messages = db
        .get('chats')
        .find({ chatId: req.params.chatId })
        .get('messages')
        .value();

    res.json({ status: 'OK', data: messages });
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

// POST /chats/:chatId/messages
router.post('/:chatId/messages', (req, res, next) => {
    const usersId = db
        .get('chats')
        .find({ chatId: req.params.chatId })
        .get('usersId')
        .value();

    console.log('usersId', usersId);

    const message = newMessage(req.cookies.id, req.body.text, usersId);

    const chat = db
        .get('chats')
        .find({ chatId: req.params.chatId })
        .get('messages')
        .push(message)
        .write();

    console.log(chat);

    res.json({ status: 'OK', data: message });
});

// PATCH /chats/:chatId
// router.patch('/:chatId', (req, res, next) => {
//     const chat = db
//         .get('chats')
//         .find({ chatId: req.params.chatId })
//         .assign(req.body)
//         .value();

//     db.write();

//     res.json({ status: 'OK', data: chat });
// });

// PATCH /chats/:chatId?
router.patch('/:chatId', (req, res, next) => {
    const chat = db
        .get('chats')
        .find({ chatId: req.params.chatId })
        .get('messages')
        .find({ id: req.query.id })
        .get('isHighlight')
        .get(req.query.myId)
        .toggleBoolean()
        .value();

    db.write();
    console.log('chat', chat);

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
