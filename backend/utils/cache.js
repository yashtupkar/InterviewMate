const NodeCache = require("node-cache");

// Initialize cache with a default standard Time-To-Live of 1 hour (3600 seconds)
// checkperiod: period in seconds used for the automatic delete check interval
const appCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

module.exports = appCache;
