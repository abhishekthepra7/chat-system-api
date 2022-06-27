// const passport = require('passport');
// const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('../db');

const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const config = require("config");
const jwtSecret = config.get("secret"); 
// passport.use(
//     'signup',
//     new localStrategy(
//         {
//             usernameField: 'email',
//             passwordField: 'password'
//         },
//         async (email, password, done) => {
//             try {
//                 const password2 = bcrypt.hash(password, 10);
//                 const query = `INSERT`
//                 db.performQuery();
//                 return done(null, user);
//             } catch (error) {
//                 done(error);
//             }
//         }
//     )
// );

async function parseToken (req, res,next) {
    let token = req.headers.authorization;
    if(!token) {
        next(createError(401, "unauthorised"))
        return;
    }
    token = token.replace("Bearer ", "");
    let result;
    try{
        result = await jwt.verify(token, jwtSecret);
    } catch(err) {
        next(createError(401, err.message))
        return;
    }
    req.identity = {
        userId: result.userId,
        isAdmin: result.isAdmin
    }
    next();
}

module.exports.parseToken = parseToken;