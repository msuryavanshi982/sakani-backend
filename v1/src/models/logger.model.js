const pino = require("pino");


const logger = () => {
  logging = pino({
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  });

  return logging;
};

module.exports = logger;
