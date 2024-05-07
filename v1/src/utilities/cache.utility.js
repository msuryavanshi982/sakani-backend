const NodeCache = require("node-cache");
const cache = new NodeCache();

const setData = (username, data) => {
  cache.set(username, data);
};

const getData = async (username) => {
  var cData = await cache.get(username);
  return cData.token;
};

module.exports = { setData, getData };








