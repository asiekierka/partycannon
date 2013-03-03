exports.info = {
  shortname: "logs",
  name: "Logs",
  descrption: "Keeps a backlog",
  version: "0.1"
}
var _ = require("underscore");
var config = null
  , util = null
  , global = null;

exports.onLoad = function(c,u) { config = c; util = u; global = util.global; return true; }
exports.onMessage = function(from,to,msg,cb) {
  if(util.isChannel(to)) {
    if(!_.isArray(global.channels[to].log)) global.channels[to].log = [];
    global.channels[to].log.push({ from: from, to: to, message: msg });
    if(config.logs && config.logs.max < global.channels[to].log.length)
      global.channels[to].log.shift();
  }
  cb(true);
}
