const router = require("express").Router();

const settings = require("./settings");
const login = require("./login");
const agents = require("./agents");

const leads = require("./leads");
const properties = require("./properties");
const dashboard = require("./dashboard");
const validateToken = require("../middleware/jwt/jwt.middleware");

router.use("/settings", settings);
router.use("/user", login);
router.use("/agents", agents);
router.use("/properties", properties);
router.use("/leads", leads);
router.use("/dashboard", dashboard);

module.exports = router;
