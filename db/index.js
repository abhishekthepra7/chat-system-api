const initializeDB = require('./initializeDB');

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
// const db = new sqlite3.Database(':memory:', (err) => {
//     if(err) console.log(err);
//     console.log("Connected to DB");

//     // db.close((err) => {
//     //     if(err) console.log(err.message);
//     //     console.log("closed the connection");
//     // });
// });
let db;
async function initDB() {
    db = await open({
        filename: 'sqlite.db',
        driver: sqlite3.Database
    })
    initializeDB(db);
}

function getDBInstance() {
    return db;
}

module.exports.initDB = initDB;
module.exports.getDBInstance = getDBInstance;

