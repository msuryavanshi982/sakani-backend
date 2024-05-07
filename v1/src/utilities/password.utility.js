const bcrypt = require("bcrypt");

const encryptPassword = async (password) => {
  hash = bcrypt.hashSync(password, 10);
  return hash;
};

const decryptPassword = async (password, hash) => {
  result = bcrypt.compareSync(password, hash);
  return result;
};

module.exports = { encryptPassword, decryptPassword };
