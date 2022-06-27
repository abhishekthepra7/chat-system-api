var createError = require('http-errors')

class Group {
    constructor(db){
        if(!db) throw new createError(500, "db is required in Group");
        this.db = db;
    }
    async getGroup(id) {
        const query = `Select * from groups where id = ?`
        const result = await this.db.get(query, [ id ]);
        return result;
    }

    async createGroup(name) {
        const query = "INSERT INTO groups (name) VALUES (?)";
        const result = await this.db.run(query, [ name ]);
        return result;
    }

    async findUsersInGroup(id) {
        const query = "Select * from usergroupmap where group_id = ?"
        const result = await this.db.all(query,[id]);
        return result.map(group => group.user_id);
    }
    async deleteGroup(id) {
        const query = "Delete from groups where id = ?";
        const result = await this.db.run(query, [ id ]);
        return result;
    }

    async addUserInGroup(userId, groupId) {
        const query = "INSERT INTO usergroupmap ( user_id, group_id ) VALUES (?, ?)";
        const result = await this.db.run(query, [ userId, groupId ]);
        return result;
    }

    async removeUserInGroup(userId, groupId) {
        const query = "Delete from usergroupmap where user_id = ? AND group_id = ?";
        const result = await this.db.run(query, [ userId, groupId ]);
        return result;
    }

    async sendMessageInGroup(body, userId, groupId) {
        const query = "INSERT INTO groupmessages ( body, user_id, group_id ) VALUES (?, ?, ?)"
        const result = await this.db.run(query, [ body, userId, groupId ]);
        return result;
    }

    async getMessageInGroup(id) {
        const query = "Select * from groupmessages where group_id = ?"
        const result = await this.db.all(query, [id]);
        return result;
    }
}

module.exports = Group;