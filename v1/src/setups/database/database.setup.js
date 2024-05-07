const { info, error } = require("../logger/logger.setup");
const mysql = require("mysql");
const fs = require("fs");
dotenv = require("dotenv");

// Mysql database connection :=>
const mysqlConn = mysql.createPool(
  {
    host: process.env.HOST_MYSQL,
    user: process.env.USER_MYSQL,
    database: process.env.DATABASE_MYSQL,
    password: process.env.PASSWORD_MYSQL,
    port: process.env.PORT_MYSQL,
    waitForConnections: true,
    connectionLimit: 2000,
    queueLimit: 0,
    multipleStatements: true,
    // ssl: { ca: fs.readFileSync(process.env.certificate) },
  },
  { debug: true }
);

const WQuery = (query) => {
  return new Promise((res, rej) => {
    mysqlConn.query(query, function (err, result, fields) {
      if (err) {
        error(
          (data = {
            name: "error",
            status: 304,
            message: `error occured while updating ${err}`,
            statusCode: 304,
          })
        );
        rej("error occured");
      } else {
        info(
          (data = {
            name: "success",
            status: 201,
            message: "update query successfully completed",
            statusCode: 201,
          })
        );
        res("successfully updated");
      }
    });
  });
};

const RQuery = (query) => {
  return new Promise((res, rej) => {
    mysqlConn.query(query, function (err, result, fields) {
      if (err) {
        error(
          (data = {
            name: "error",
            status: 304,
            message: `error occured while reading ${err}`,
            statusCode: 304,
          })
        );
        res([]);
      } else if (result.length > 0) {
        info(
          (data = {
            name: "success",
            status: 201,
            message: "read query successfully completed",
            statusCode: 201,
          })
        );
        res(result);
      } else {
        info(
          (data = {
            name: "success",
            status: 201,
            message: "read query successfully completed",
            statusCode: 201,
          })
        );
        res([]);
      }
    });
  });
};

const checkSchema = () => {
  // WQuery(models.myProfile);
  // WQuery(models.leads);
  // WQuery(models.alertServiceWorker);
  // WQuery(models.liveView);
  // WQuery(models.notificationConfig);
  // WQuery(models.violationConfig);
  // WQuery(models.violationLogs);
  // WQuery(models.workerList);
};

module.exports = { RQuery, WQuery, checkSchema };
