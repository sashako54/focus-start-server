const router = require('express').Router();
const db = require('../db/db');
const { validate } = require('jsonschema');
const { newMessages } = require('../core/store');

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
        .filter(obj => obj.isVisible[req.cookies.id] === true)
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

    // добавление сообщения в память

    usersId
        .filter(id => id !== req.cookies.id)
        .map(id => {
            if (!newMessages[id]) {
                newMessages[id] = [];
            }
            newMessages[id].push(message);
        });

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
    const value = db
        .get('chats')
        .find({ chatId: req.params.chatId })
        .get('messages')
        .find({ id: req.query.id })
        .get('isHighlight')
        .get(req.query.myId)
        .value();

    console.log('value', value);

    const chat = db // TODO: посмотреть, нужен ли этот блок
        .get('chats')
        .find({ chatId: req.params.chatId })
        .get('messages')
        .find({ id: req.query.id })
        .get('isHighlight')
        .set(req.query.myId, !value)
        .write();

    console.log('chat', chat);

    res.json({ status: 'OK', data: chat });
});

// DELETE /chats/:id
// router.delete('/:id', (req, res) => {
//     db.get('chats')
//         .remove({ id: req.params.id })
//         .write();

//     res.json({ status: 'OK' });
// });

// DELETE /chats/:chatId/messages? TODO: реализовать удаление сообщений
router.patch('/:chatId/messages', (req, res, next) => {
    for (let prop of req.body.highlightMessagesList) {
        db.get('chats')
            .find({ chatId: req.params.chatId })
            .get('messages')
            .find({ id: prop })
            .get('isVisible')
            .set(req.cookies.id, false)
            .write();

        console.log(
            'req.body.highlightMessagesList',
            req.body.highlightMessagesList
        );
        console.log('req.params.chatId', req.params.chatId);
        console.log('prop', prop);
        console.log('req.cookies.id', req.cookies.id);
    }

    // проверка флагов, на случай, если isVisivle все false -> удалить сообщение
    for (let prop of req.body.highlightMessagesList) {
        const isVisible = db
            .get('chats')
            .find({ chatId: req.params.chatId })
            .get('messages')
            .find({ id: prop })
            .get('isVisible')
            .value();

        const conditionOfDelete = Object.values(isVisible).every(item => {
            if (item === false) return true;
        });

        if (conditionOfDelete) {
            db.get('chats')
                .find({ chatId: req.params.chatId })
                .get('messages')
                .remove({ id: prop })
                .write();
        }
    }
    res.json({ status: 'OK' });
});

module.exports = router;
