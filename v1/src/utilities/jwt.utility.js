const jwt = require("jsonwebtoken");
const { setData } = require("./cache.utility");

const generateAccessToken = (username) => {
  const accessToken = jwt.sign({ username }, process.env.access_token_secret, {
    expiresIn: 15 * 60,
  });
  setData(`${username}_access`, { token: accessToken });
  return accessToken;
};

const generateRefreshToken = (username) => {
  const refreshToken = jwt.sign(username, process.env.refresh_token_secret);
  setData(`${username}_refresh`, { token: refreshToken });
  return refreshToken;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
