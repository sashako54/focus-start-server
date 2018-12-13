const router = require('express').Router();
const db = require('../db/db');
const { newMessages } = require('../core/store');

//GET/new-message

router.get('/new-messages', (req, res) => {
    let newMessagesUpdate;
    if (newMessages[req.cookies.id].length !== 0) {
        newMessagesUpdate = [].concat(newMessages[req.cookies.id]);
        newMessages[req.cookies.id] = [];
        res.json({ status: 'OK', data: newMessagesUpdate });
    }

    res.json({ status: 'FAIL' });
});

module.exports = router;
