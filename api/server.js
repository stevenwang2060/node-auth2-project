const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");

const usersRouter = require("../users/users-router.js");
const authRouter = require("../auth/router.js");
const restricted = require("../auth/restricted-middleware.js");


const server = express();

const sessionConfig = {
    name: "users",
    secret: "secret code",
    cookie: {
      maxAge: 1000 * 60 * 60,
      secure: false, // true in production to send only over https
      httpOnly: true, // true means no access from JS
    },
    resave: false,
    saveUninitialized: true, // GDPR laws require to check with client
  };

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));

server.use("/api/users", restricted, checkRole("user"), usersRouter);
server.use("/api/auth", authRouter);

server.get("/", (req, res) => {
  res.json({ api: "up" });
});

function checkRole(role) {
  return (req, res, next) => {
    if(req.decodedToken && 
      req.decodedToken.role === role 
      && req.decodedToken.role.toLowerCase() === role) {
        next();
    }
    else {
      res.status(403).json({message: "you shall not pass!"});
    }
  }
};

module.exports = server;