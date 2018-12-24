const router = require('express').Router();
const { newMessages } = require('../core/store');

//GET/new-messages/:chatId
router.get('/new-messages/:chatId', (req, res) => {
    const { chatId } = req.params;
    const { id } = req.cookies;
    let newMessagesUpdate = [];
    let numNewMessages = {};

    // формирование списка новых сообщений
    if (newMessages[chatId] && newMessages[chatId][id]) {
        if (newMessages[chatId][id].length !== 0) {
            newMessagesUpdate = [].concat(newMessages[chatId][id]);
            newMessages[chatId][id] = [];
        }
    }

    // получение количества новых сообщений по всем чатам,
    // в которых состоит user, кроме того, который передан в параметрах
    for (let key in newMessages) {
        console.log('key', key);
        if (key !== chatId) {
            if (newMessages[key][id] && newMessages[key][id].length) {
                numNewMessages[key] = newMessages[key][id].length;
            }
        }
    }

    if (Object.keys(numNewMessages).length || newMessagesUpdate.length) {
        res.json({
            status: 'OK',
            data: { newMessagesUpdate, numNewMessages }
        });
    }

    res.json({ status: 'FAIL' });
});

module.exports = router;
