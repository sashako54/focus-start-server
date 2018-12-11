const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

db.defaults({ messages: [] }).write();

db._.mixin({
    toggleBoolean: elem => {
        console.log('elem', elem);
        return !elem;
    }
});

module.exports = db;
