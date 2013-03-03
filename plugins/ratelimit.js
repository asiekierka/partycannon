exports.info = {
  shortname: "ratelimit",
  name: "Rate limit",
  descrption: "Adds rate limiting support",
  version: "0.1"
}

var    _ = require("underscore");

var config = null;
var util = null;
var lastCommand = {};

exports.onLoad = function(c,u) { config = c; util = u; return true; }
exports.onCommand = function(from,to,cmdName,cmd,cb) {
  if(!lastCommand[from] || lastCommand[from] < util.time()) {
    lastCommand[from] = util.time() + config.rateLimit;
    cb(true);
  }
  cb(false);
}
