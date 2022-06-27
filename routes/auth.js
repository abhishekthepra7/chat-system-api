var express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const { getDBInstance } = require("../db");
const config = require("config");
const jwtSecret = config.get("secret"); 
const User = require("../resources/user");

router.post("/", async (req, resp, next) => {
    const userId = req.body.userId;
    const password = req.body.password;
    if(!userId || !password) {
        return next(createError(400, "userId and password is required"));
    }
    //db.performQuery()
    const userHandler = new User(getDBInstance());
    const user = await userHandler.getUser(userId, true);
    if(!user) return next(createError(404, "userId not found"));
    const isEqual = await bcrypt.compare(password, user.password);
    if(!isEqual) {
        return next(createError(400, "Invalid password  or user id"));
    }
    const token = jwt.sign({ userId, isAdmin: user.isAdmin }, jwtSecret, {expiresIn: 12 * 60 * 60});
    resp.send({ token });
})

module.exports = router;