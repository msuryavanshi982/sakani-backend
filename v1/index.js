require("dotenv").config();
const uuid = require("uuid").v4();
const app = require("./src/setups/server/server.setup");
app(uuid).listen(process.env.serverPort || 8080);
