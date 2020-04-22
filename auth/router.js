const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const router = require("express").Router();
const { jwtSecret } = require('../config/secrets');
const Users = require("../users/users-model.js");

router.post("/register", (req, res) => {
  const userInfo = req.body;

  // the pasword will be hashed and re-hashed 2 ^ 8 time
  const ROUNDS = process.env.HASHING_ROUNDS || 8;
  const hash = bcrypt.hashSync(userInfo.password, ROUNDS);

  userInfo.password = hash;

  Users.add(userInfo)
    .then(user => {
      res.json(user);
    })
    .catch(err => res.send(err));
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      console.log(username);
      if (user && bcrypt.compareSync(password, user.password)) {
        // remember this client
        const token = generateToken(user);
        res.status(200).json({ 
          hello: user.username,
          token // send the token
         });
      } else {
        res.status(401).json({ message: "invalid credentials" });
      }
    })
    .catch(error => {
      res.status(500).json({ errorMessage: "error finding the user" });
    });
});

router.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy(error => {
      if (error) {
        res
          .status(500)
          .json({
            message:
              "error logging out",
          });
      } else {
        res.status(200).json({ message: "logged out successful" });
      }
    });
  } else {
    res.status(200).json({ message: "I don't know you" });
  }
});


function generateToken(user) {
  const payload = {
    username: user.username,
    role: user.role || "user"
  };

  const secret = jwtSecret;

  const options = {
    expiresIn: '1h',
  }
  
  return jwt.sign(payload, secret, options);

}

module.exports = router;