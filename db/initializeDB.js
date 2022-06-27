const config = require("config");
const superUserUserId = config.get("superUserId");
const superUserPassword = config.get("superUserPassword");
const bcrypt = require("bcrypt");

async function initializeDB(db) {
    const createUserQuery = "CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT, password TEXT, isAdmin BOOLEAN)";
    const createGroupQuery = "CREATE TABLE IF NOT EXISTS groups (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)";
    // Message can only be sent in groups, so it will be 1:n or n:1 mapping between user & groups & message
    const createMessageQuery = "CREATE TABLE IF NOT EXISTS groupmessages (id INTEGER PRIMARY KEY AUTOINCREMENT, body TEXT, user_id TEXT, group_id INTEGER, CONSTRAINT user_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE, CONSTRAINT group_id_fk FOREIGN KEY (group_id) REFERENCES groups(id) ON UPDATE CASCADE ON DELETE CASCADE)"
    // Since it's n:n mapping, we need a joining/common table
    const createUserGroupMapping = "CREATE TABLE IF NOT EXISTS usergroupmap (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, group_id INTEGER, CONSTRAINT user_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE, CONSTRAINT group_id_fk FOREIGN KEY (group_id) REFERENCES groups(id) ON UPDATE CASCADE ON DELETE CASCADE)"
    // Initialise user table with a super admin user
    const insertSuperUser = `INSERT OR REPLACE INTO users VALUES ("${superUserUserId}", "SuperUser", "${await bcrypt.hash(superUserPassword,10)}", true)`;
    await db.exec(createUserQuery);
    await db.exec(createGroupQuery);
    await db.exec(createUserGroupMapping);
    await db.exec(createMessageQuery);
    await db.exec(insertSuperUser);
}

module.exports = initializeDB;