const jwt = require("jsonwebtoken");

//this middleware is used to ensure that incoming requests have a valid JWT in the "Authorization" header, and if the token is valid, it extracts and attaches the email to the request for further processing.
const validateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    res.send({
      type: "authentication",
      authentication: "token length",
      message: "Empty Token",
      status: "BAD",
      statusCode: 403,
      data: null,
    });
    return;
  }
  jwt.verify(token, process.env.access_token_secret, (err, email) => {
    if (err) {
      res.send({
        type: "authentication",
        authentication: "error in verification",
        message: `Issue with the token -- ${err}`,
        status: "BAD",
        statusCode: 403,
        data: null,
      });
      return;
    }
    req.email = email;
    next();
  });
};

module.exports = validateToken;
