const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/secrets');

module.exports = (req, res, next) => {
    const { authorization } = req.headers;
    console.log(authorization);
    const secret = jwtSecret;
    if (authorization) {
      jwt.verify(authorization, secret, (err, decodedToken) => {
        if (err) {
          console.log(err);
          res.status(401).json({ message: "invalid credentials" });
        }
        else {
          req.decodedToken = decodedToken;
          next();
        }
      })
    }
    else {
      res.status(400).json({ message: "No credentials provided"});
    }
  };