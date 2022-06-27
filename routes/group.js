var express = require('express');
const { getDBInstance } = require('../db');
const router = express.Router();
const Group = require("../resources/group");
const { parseToken } = require("../middlewares/auth");
const User = require('../resources/user');
const createHttpError = require('http-errors');

router.use(parseToken);
//router.get("/", (req, resp, next) => {})

router.get("/:id", async (req, resp, next) => {
    const groupHandler =  new Group(getDBInstance());
    const result = await groupHandler.getGroup(req.params.id);
    if(!result) return next(createHttpError(404, "group not found"))
    resp.send(result);
})

router.get("/:groupId/user", async (req, resp, next) => {
    const groupHandler =  new Group(getDBInstance());
    const result = await groupHandler.findUsersInGroup(req.params.groupId);
    resp.send(result);
})

router.post("/", async (req, resp, next) => {
    const groupName = req.body.name;
    if(!groupName) return next(createHttpError(400, "group name is required"));
    const groupHandler =  new Group(getDBInstance());
    const result = await groupHandler.createGroup(groupName);
    resp.status(201).send(result);
})

router.delete("/:id", async (req, resp, next) => {
    const groupHandler =  new Group(getDBInstance());
    const group = await groupHandler.getGroup(req.params.id);
    if(!group) return next(createHttpError(404, "Group not found"));
    const result = await groupHandler.deleteGroup(req.params.id);
    resp.send(result);
})

router.post("/:groupId/user/:userId", async (req, resp, next) => {
    const groupHandler =  new Group(getDBInstance());
    const userHandler = new User(getDBInstance());
    const user = await userHandler.getUser(req.params.userId);
    if(!user) return next(createHttpError(404, "User not found"));
    const group = await groupHandler.getGroup(req.params.groupId);
    if(!group) return next(createHttpError(404, "Group not found"));
    const result = await groupHandler.addUserInGroup(req.params.userId, req.params.groupId);
    resp.status(201).send(result);
})

router.delete("/:groupId/user/:userId", async (req, resp, next) => {
    const groupHandler =  new Group(getDBInstance());
    const userHandler = new User(getDBInstance());
    const user = await userHandler.getUser(req.params.userId);
    if(!user) return next(createHttpError(404, "User not found"));
    const group = await groupHandler.getGroup(req.params.groupId);
    if(!group) return next(createHttpError(404, "Group not found"));
    const result = await groupHandler.removeUserInGroup(req.params.userId, req.params.groupId);
    resp.status(200).send(result);
})

router.post("/:groupId/message", async (req, resp, next) => {
    const groupHandler =  new Group(getDBInstance());
    const group = groupHandler.getGroup(req.params.groupId);
    if(!group) return next(createHttpError(404, "Group not found"));
    const result = await groupHandler.sendMessageInGroup(req.body.body,req.identity.userId, req.params.groupId);
    resp.status(201).send(result);
})

router.get("/:groupId/message", async (req, resp, next) => {
    const groupHandler =  new Group(getDBInstance());
    const group = groupHandler.getGroup(req.params.groupId);
    if(!group) return next(createHttpError(404, "Group not found"));
    const result = await groupHandler.getMessageInGroup(req.params.groupId);
    resp.send(result);
})

module.exports = router;