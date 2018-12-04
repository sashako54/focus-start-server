const router = require('express').Router();
const db = require('../db/db');
const { validate } = require('jsonschema');

const newMessage = (name, text, date) => ({
    id: String(
        Math.random()
            .toString(16)
            .split('.')[1]
    ),
    name,
    text,
    date,
    isCompleted: false
});

// router.use('/:id', (req, res, next) => {
//     const message = db
//         .get('messages')
//         .find({ id: req.params.id })
//         .value();

//     if (!message) {
//         next(new Error('CAN_NOT_FIND_MESSAGE'));
//     }
// });

// GET /messages
router.get('/', (req, res) => {
    const messages = db.get('messages').value();

    res.json({ status: 'OK', data: messages });
});

// GET /messages/:id
router.get('/:id', (req, res) => {
    const message = db
        .get('messages')
        .find({ id: req.params.id })
        .value();

    res.json({ status: 'OK', data: message });
});

// POST /messages
router.post('/', (req, res, next) => {
    const message = newMessage(req.body.name, req.body.text, req.body.date);
    console.log(message);

    db.get('messages')
        .push(message)
        .write();

    res.json({ status: 'OK', data: message });
});

// PATCH /messages/:id
router.patch('/:id', (req, res, next) => {
    const message = db
        .get('messages')
        .find({ id: req.params.id })
        .assign(req.body)
        .value();

    db.write();

    res.json({ status: 'OK', data: message });
});

// DELETE /messages/:id
router.delete('/:id', (req, res) => {
    db.get('messages')
        .remove({ id: req.params.id })
        .write();

    res.json({ status: 'OK' });
});

module.exports = router;
