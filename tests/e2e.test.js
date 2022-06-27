const config = require("config");
const { request } = require("express");
const endpoint = config.get("testingUrl");
const axios = require("axios").default;

const authBasePath = endpoint + "/authenticate";
const userBasePath = endpoint + "/user";
const groupBasePath = endpoint + "/group";

// super use is just an admin which is created at inception
const superUserId = "superuser";
const superUserPassword = "superpassword";
let adminToken, normalUserToken;
const adminUser = {
    userId: "Admin1",
    name: "Admin",
    password: "admin123",
    isAdmin: true
}
const normalUser = {
    userId: "Normal1",
    password: "normal123",
    name: "normal user 1"
}
const group1 = {
    name: "Popular"
};
const group2 = {
    name: "More popular"
}
describe("e2e user tests", () => {
    it("admin can be authenticated", async () => {
        const result = await axios.post(authBasePath, { userId: superUserId, password: superUserPassword });
        expect(request.token).not.toBeNull();
    })
    it("admin can create admins", async () => {
        const result = await axios.post(authBasePath, { userId: superUserId, password: superUserPassword });
        const token = result.data.token;

        let response = await axios.post(userBasePath, adminUser, { headers: { Authorization: token} })
        expect(response.status).toBe(201);

        response = await axios.post(authBasePath, { userId: adminUser.userId, password: adminUser.password });
        adminToken = response.data.token;
    })
    it("admin can create normal users", async () => {
        let response = await axios.post(userBasePath, {userId: "normal 232", ...normalUser}, { headers: { Authorization: adminToken} })
        expect(response.status).toBe(201);
        response = await axios.post(authBasePath, { userId: normalUser.userId, password: normalUser.password });
        normalUserToken = response.data.token;
    })
    it("normal users can not create any user", async () => {
        const norMalUserId = "dummyNormal";
        const dummyAdmin = "dummAdmin";
        try{
            await axios.post(userBasePath, { ...normalUser, userId: norMalUserId }, { headers: { Authorization: normalUserToken} })
        } catch(err) {
            expect(err.response.status).toBe(401);
        }

        try{
            await axios.post(userBasePath, { ...adminUser, userId: dummyAdmin }, { headers: { Authorization: normalUserToken} })
        } catch(err) {
            expect(err.response.status).toBe(401);
        }
    })
    it("user id should be unique", async () => {
        try {
            await axios.post(userBasePath, adminUser, { headers: { Authorization: adminToken} })
        } catch(err) {
            expect(err.response.status).toBe(400);
        }

        try{
            await axios.post(userBasePath, normalUser, { headers: { Authorization: adminToken} })
        } catch(err) {
            expect(err.response.status).toBe(400);
        }
    })

    it("normal user can not delete any user but admin can delete admins & normal user", async () => {
        const newAdminUserId = "dummyAdmin";
        const newNormalUserId = "dummNormal321";
        let response = await axios.post(userBasePath, { ...adminUser, userId: newAdminUserId}, { headers: { Authorization: adminToken} })
        expect(response.status).toBe(201);

        response = await axios.post(userBasePath, { ...normalUser, userId: newNormalUserId}, { headers: { Authorization: adminToken} })
        expect(response.status).toBe(201);

        try{
            await axios.delete(userBasePath + `/${newAdminUserId}`, { headers: { Authorization: normalUserToken} })
        } catch(err) {
            expect(err.response.status).toBe(400);
        }

        try{
            await axios.delete(userBasePath + `/${newNormalUserId}`, { headers: { Authorization: normalUserToken} })
        } catch(err) {
            expect(err.response.status).toBe(400);
        }

        response = await axios.delete(userBasePath + `/${newAdminUserId}`, { headers: { Authorization: adminToken} })
        expect(response.status).toBe(200);

        response = await axios.delete(userBasePath + `/${newNormalUserId}`, { headers: { Authorization: adminToken} })
        expect(response.status).toBe(200);
    })

    it("Any use can get any user",async () => {
        let response = await axios.get(userBasePath+ `/${normalUser.userId}`, { headers: { Authorization: adminToken} })
        expect(response.data.id).toBe(normalUser.userId);

        response = await axios.get(userBasePath+ `/${adminUser.userId}`, { headers: { Authorization: normalUserToken} })
        expect(response.data.id).toBe(adminUser.userId);
    })
})


describe("e2e group tests", () => {
    it("Any user must be able to create & delete group", async () => {
        let response = await axios.post(groupBasePath, group1, { headers: { Authorization: adminToken} })
        expect(response.status).toBe(201);
        group1.id = response.data.lastID;

        response = await axios.post(groupBasePath, group2, { headers: { Authorization: normalUserToken} })
        expect(response.status).toBe(201);
        group2.id = response.data.lastID;

        const dummGroup1 = {
            name: "dummy1"
        }
        const dummGroup2 = {
            name: "dummy2"
        }

        response = await axios.post(groupBasePath, dummGroup1, { headers: { Authorization: adminToken} })
        expect(response.status).toBe(201);
        const groupId1 = response.data.lastID;

        response = await axios.post(groupBasePath, dummGroup2, { headers: { Authorization: adminToken} })
        expect(response.status).toBe(201);
        const groupId2 = response.data.lastID;

        response = await axios.delete(groupBasePath + `/${groupId1}`, { headers: { Authorization: adminToken} })
        expect(response.status).toBe(200);

        response = await axios.delete(groupBasePath + `/${groupId2}`, { headers: { Authorization: normalUserToken} })
        expect(response.status).toBe(200);
    })

    it("Any user must be able to add & remove users to group", async () => {
        response = await axios.post(groupBasePath + `/${group1.id}` + "/user" + `/${normalUser.userId}`, {}, { headers: { Authorization: adminToken} })
        expect(response.status).toBe(201);

        response = await axios.post(groupBasePath + `/${group1.id}` + "/user" + `/${adminUser.userId}`, {}, { headers: { Authorization: normalUserToken} })
        expect(response.status).toBe(201);

        response = await axios.delete(groupBasePath + `/${group1.id}` + "/user" + `/${normalUser.userId}`,  { headers: { Authorization: adminToken} })
        expect(response.status).toBe(200);

        response = await axios.delete(groupBasePath + `/${group1.id}` + "/user" + `/${adminUser.userId}`, { headers: { Authorization: normalUserToken} })
        expect(response.status).toBe(200);
    })

    it("Any users should be able to see all members of group", async () => {
        response = await axios.post(groupBasePath + `/${group1.id}` + "/user" + `/${normalUser.userId}`, {},  { headers: { Authorization: adminToken} })
        expect(response.status).toBe(201);

        response = await axios.post(groupBasePath + `/${group1.id}` + "/user" + `/${adminUser.userId}`, {}, { headers: { Authorization: normalUserToken} })
        expect(response.status).toBe(201);

        response = await axios.get(groupBasePath + `/${group1.id}` + "/user", { headers: { Authorization: adminToken} })
        expect(response.data.length).toBe(2);

        response = await axios.get(groupBasePath + `/${group1.id}` + "/user", { headers: { Authorization: normalUserToken} })
        expect(response.data.length).toBe(2);
    })

    it("Any user who is member of group must be able to send message in group", async () => {
        const messageBody = {
            body: "Hello, How are you?"
        }

        response = await axios.post(groupBasePath + `/${group1.id}` + "/message", messageBody, { headers: { Authorization: adminToken} })
        expect(response.status).toBe(201);

        response = await axios.post(groupBasePath + `/${group1.id}` + "/message", messageBody, { headers: { Authorization: normalUserToken} })
        expect(response.status).toBe(201);
    })

    it("Any users in group should  be able to see all essages in group", async () => {
        response = await axios.get(groupBasePath + `/${group1.id}` + "/message", { headers: { Authorization: adminToken} })
        expect(response.data.length).toBe(2);

        response = await axios.get(groupBasePath + `/${group1.id}` + "/message", { headers: { Authorization: normalUserToken} })
        expect(response.data.length).toBe(2);
    })

})

afterAll(async ()=> {
    await axios.delete(groupBasePath + `/${group1.id}`, { headers: { Authorization: adminToken} })
    await axios.delete(groupBasePath + `/${group2.id}`, { headers: { Authorization: adminToken} })

    await axios.delete(userBasePath + `/${normalUser.userId}`, { headers: { Authorization: adminToken} })
    await axios.delete(userBasePath + `/${adminUser.userId}`, { headers: { Authorization: adminToken} })

})