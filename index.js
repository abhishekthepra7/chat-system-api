const express = require("express");
const router = express.Router();
const api = express(); // default logger is console
const config = require("config");
const authRoute = require("./routes/auth");
const userRoutes = require("./routes/user");
const groupRoutes = require("./routes/group");
const bodyParser = require("body-parser");
const { initDB } = require("./db");

initDB();
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({ extended: true }));
// api.use((err, req, res, next) => {
//     console.error(err.stack)
//     res.status(500).send('Something broke!')
//   })
api.use("/authenticate", authRoute);
api.use("/user", userRoutes);
api.use("/group",groupRoutes);

try {
    api.listen(config.PORT, ()=> {
        console.log("started listening on port", config.PORT);
    });
} catch(err) {
    console.log(err);
}
