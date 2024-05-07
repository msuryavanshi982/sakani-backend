const bcrypt = require("bcrypt");

const decryptPassword = async (password, hash) => {
  result = bcrypt.compareSync(password, hash);
  return result;
};

module.exports = { decryptPassword };
