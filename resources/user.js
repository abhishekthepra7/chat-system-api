var createError = require('http-errors')
const bcrypt = require("bcrypt");

class User {
    constructor(db){
        if(!db) throw new Error("db is required in Group");
        this.db = db;
    }

    async getAllUsers() {
        const query = "Select * from users";
        const result = await this.db.all(query);
        return result;
    }

    async getUser(userId, shouldShowPassword = false) {
        const query = `Select * from users where id = ?`
        const result = await this.db.get(query, [ userId ]);
        if(result && !shouldShowPassword) {
            delete result.password;
            return result;
        }
        return result;
    }
    async createUser(id, name, password, isAdmin) {
        const encodedPassword = await bcrypt.hash(password, 10);
        const query = `INSERT INTO users (id, name, password, isAdmin)
        VALUES (?, ?, ?, ?)`;
        const results = await this.db.run(query, [id, name, encodedPassword, isAdmin]);
        return results;
    }
    async deleteUser(userId) {
        const query = `Delete from users where id = ?`
        const result = await this.db.run(query, [ userId ]);
        return result;
    }
    async mofidyUser() {}
}

module.exports = User;