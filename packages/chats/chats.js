const router = require('express').Router();
const db = require('../db/db');
const { newMessages } = require('../core/store');

const newChat = (users, usersId) => ({
    chatId: String(
        Math.random()
            .toString(16)
            .split('.')[1]
    ),
    users,
    usersId,
    messages: []
});

const newMessage = (userId, text, usersId, name) => ({
    id: String(
        Math.random()
            .toString(16)
            .split('.')[1]
    ),
    name,
    userId,
    text,
    date: new Date().getTime(),
    isHighlight: usersId.reduce((previousValue, currentValue) => {
        previousValue[currentValue] = false;
        return previousValue;
    }, {}),
    isVisible: usersId.reduce((previousValue, currentValue) => {
        previousValue[currentValue] = true;
        return previousValue;
    }, {})
});

// GET /chats
// запрашивает чаты, в которых состоит user
router.get('/', (req, res) => {
    const chats = db
        .get('chats')
        // берем все чаты, в которых есть userId
        .filter(chat => chat.usersId.some(id => id === req.cookies.id))
        // отправляем только chatId и users
        .map(chat => ({ chatId: chat.chatId, users: chat.users }))
        .value();

    res.json({ status: 'OK', data: chats });
});

// GET /chats/:userId
// ищет чат, в котором только 2 users, среди которых 1 сам user, а второй, на которого кликнули
// для проверки существования чата с конкретным юзером
router.get('/:userId', (req, res) => {
    const chat = db
        .get('chats')
        .filter(chat => {
            if (chat.usersId.length === 2) {
                if (chat.usersId.some(id => id === req.cookies.id)) {
                    if (chat.usersId.some(id => id === req.params.userId)) {
                        return true;
                    }
                }
            }
        })
        .value();

    console.log('chats', chat[0]);

    res.json({ status: 'OK', data: chat[0] });
});

// GET /chats/:chatId/messages
router.get('/:chatId/messages', (req, res) => {
    const messages = db
        .get('chats')
        .find({ chatId: req.params.chatId })
        .get('messages')
        .filter(obj => obj.isVisible[req.cookies.id] === true)
        .value();

    const chatName = db
        .get('chats')
        .find({ chatId: req.params.chatId })
        .get('users')
        .value();

    res.json({ status: 'OK', data: { messages, chatName } });
});

// POST /chats/:userId
// создание чата по userId
router.post('/:userId', (req, res, next) => {
    const usersId = [req.params.userId, req.cookies.id];
    const userName_1 = db
        .get('users')
        .find({ id: req.params.userId })
        .get('name')
        .value();

    const userName_2 = db
        .get('users')
        .find({ id: req.cookies.id })
        .get('name')
        .value();

    const chat = newChat([userName_1, userName_2], usersId);
    console.log(chat);

    db.get('chats')
        .push(chat)
        .write();

    // добавим chatId в user.chats
    for (const prop of usersId) {
        db.get('users')
            .find({ id: prop })
            .get('chats')
            .push(chat.chatId)
            .write();
    }

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

    const message = newMessage(
        req.cookies.id,
        req.body.text,
        usersId,
        req.cookies.name
    );

    db.get('chats')
        .find({ chatId: req.params.chatId })
        .get('messages')
        .push(message)
        .write();

    // добавление сообщения в память
    usersId
        .filter(id => id !== req.cookies.id)
        .forEach(id => {
            if (!newMessages[req.params.chatId]) {
                newMessages[req.params.chatId] = {};
            }
            if (!newMessages[req.params.chatId][id]) {
                newMessages[req.params.chatId][id] = [];
            }
            newMessages[req.params.chatId][id].push(message);
        });

    console.log('newMessages', newMessages);

    res.json({ status: 'OK', data: message });
});

// DELETE /chats/:chatId/messages
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

        const conditionOfDelete = Object.values(isVisible).every(
            item => item === false
        );

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
