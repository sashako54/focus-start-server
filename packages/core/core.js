const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const error = require('../error/error');
const messagesRoutes = require('../messages/messages');
const usersRoutes = require('../users/users');
const chatsRoutes = require('../chats/chats');
const eventsRoutes = require('../events/events');

const app = express();

// app.use((req, res, next) => {
//     setTimeout(() => {
//         next();
//     }, 2000);
// });

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/v001/users', usersRoutes);

app.use('/api/v001/chats', chatsRoutes);

app.use('/api/v001/messages', messagesRoutes);

app.use('/api/v001/events', eventsRoutes);

app.use((req, res) => {
    res.json({
        status: 'BAD_REQUEST',
        messages: [error({ code: 'BAD_REQUEST' })]
    });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    res.json({ status: 'FAIL', messages: [error({ code: err.message })] });
});

module.exports = app;
