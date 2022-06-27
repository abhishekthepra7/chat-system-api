var express = require('express');
const router = express.Router();
const { parseToken } = require("../middlewares/auth");
const { getDBInstance } = require("../db");
const createHttpError = require('http-errors');
const User = require('../resources/user');

router.use(parseToken);

router.get("/", async (req, resp) => {
    const userHandler = new User(getDBInstance());
    const users = await userHandler.getAllUsers();
    resp.send(users);
})

router.get("/:id", async (req, resp, next) => {
    const userHandler = new User(getDBInstance());
    const user = await userHandler.getUser(req.params.id);
    if(!user) {
        next(createHttpError(404, "user does not exists"));
        return;
    }
    resp.send(user);
})

router.post("/", async (req, resp, next) => {
    const userHandler = new User(getDBInstance());
    // check if the requestor is an admin
    const user = await userHandler.getUser(req.identity.userId);
    if(!user.isAdmin) {
        return next(createHttpError(401, "Only admin can add/moify user"));
    }

    const { userId, name, password, isAdmin = false } = req.body;
    if(!userId || !name || !password) return next(createHttpError(400, "Please provide userId, name & password"))
    const user1 = await userHandler.getUser(userId);
    if(user1) {
        next(createHttpError(400, "user already exists"));
        return;
    }
    const results = await userHandler.createUser(userId, name, password, isAdmin);
    resp.status(201).send(results);
})

router.delete("/:id", async (req, resp, next) => {
    const userHandler = new User(getDBInstance());
    const user = await userHandler.getUser(req.identity.userId);
    if(!user.isAdmin) {
        next(createHttpError(400, "Only admin can add/moify user"));
        return;
    }
    const result = await userHandler.deleteUser(req.params.id);
    resp.send(result);
});

module.exports = router;