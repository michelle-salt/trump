const jwt = require("jsonwebtoken");

const run = async (req, res, td) => {
  console.log(req.data);
  res.send(jwt.sign({some: "data"}, "platypus6"));
};

module.exports = {
  run,
  method: "get",
  path: "/jwt"
};