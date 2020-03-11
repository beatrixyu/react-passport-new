const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const config = require("../../config");

module.exports = (req, res, next) => {
  // check if the header exists, if not fail
  // because the user cannot be authenticated without it
  if (!req.headers["x-auth-header"]) {
    return res.status(401).end("auth");
  }
  // read the token into a variable from the header
  const token = req.headers["x-auth-header"];
  // verify and decode the token
  return jwt.verify(token, config.jwtSecret, (err, decoded) => {
    // if an error occured, fail
    if (err) {
      return res.status(401).end("token");
    }
    // extract the [sub] value from the decoded data
    const { sub } = decoded;
    // try to find the user in our database
    return User.findById(sub, (userErr, user) => {
      // if the user does not exist (anymore), fail
      if (userErr || !user) return res.status(401).end("user");
      // add the user to the request object
      req.user = user;
      // make sure the user object has a group key
      req.user.group = req.user.group || [];
      // if the user is in the configured list of admins
      //   promote him by adding 'admin' to the group list
      if (config.admins.includes(user.authId)) req.user.group.push("admin");
      // call the next function to finish the middleware
      return next();
    });
  });
};
