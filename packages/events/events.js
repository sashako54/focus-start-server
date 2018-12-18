const router = require('express').Router();
const db = require('../db/db');
const { newMessages } = require('../core/store');

//GET/new-message

router.get('/new-messages/:chatId', (req, res) => {
    const { chatId } = req.params;
    const { id } = req.cookies;
    let newMessagesUpdate;
    if (newMessages[chatId]) {
        if (newMessages[chatId][id]) {
            if (newMessages[chatId][id].length !== 0) {
                newMessagesUpdate = [].concat(newMessages[chatId][id]);
                newMessages[chatId][id] = [];
                res.json({ status: 'OK', data: newMessagesUpdate });
            }
        }
    }
    res.json({ status: 'FAIL' });
});

module.exports = router;
