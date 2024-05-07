const bcrypt = require("bcrypt");

const encryptPassword = async (password) => {
  hash = bcrypt.hashSync(password, 10);
  return hash;
};

module.exports = { encryptPassword };
