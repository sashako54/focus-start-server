const router = require('express').Router();
const db = require('../db/db');
const { newMessages } = require('../core/store');

//GET/new-message

router.get('/new-messages', (req, res) => {
    let newMessagesUpdate;
    if (newMessages[req.cookies.id]) {
        newMessagesUpdate = newMessages[req.cookies.id];
        // delete newMessages[req.cookies.id];
    }

    console.log('newMessages[req.cookies.id]', newMessages[req.cookies.id]);
    res.json({ status: 'OK', data: newMessagesUpdate });
});
