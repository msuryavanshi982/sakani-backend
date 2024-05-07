const { RQuery, checkSchema } = require("../database/database.setup");
const { info } = require("../logger/logger.setup");

const dbValidation = async () => {
  var Tables_in_base = await RQuery(`
        SHOW TABLES;
    `);
  if (Tables_in_base.length >= 7) {
    info(
      (data = {
        funcName: "dbValidation()",
        message: "All required tables exists",
        status: "OK",
        statusCode: 201,
      })
    );
  } else {
    await checkSchema();
    info(
      (data = {
        funcName: "dbValidation()",
        message: "Some tables missing, create function initiated",
        status: "OK",
        statusCode: 201,
      })
    );
  }
  return;
};

module.exports = dbValidation;
