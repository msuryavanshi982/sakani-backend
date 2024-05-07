const router = require("express").Router();
const { getPropertyData } = require("../../setups/query/query.properties");

router.get("/all/:mobile", getPropertyData);

module.exports = router;
