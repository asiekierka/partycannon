exports.info = {
  shortname: "users",
  name: "Users and groups",
  descrption: "Adds whois-based groups",
  version: "0.1"
}

var    _ = require("underscore");

var config = null;
var util = null;
var lastCommand = {};

exports.onLoad = function(c,u) { config = c; util = u; return true; }
exports.onCommand = function(from,to,cmdName,cmd,cb) {
  // Get user level
  util.client.whois(from, function(whois) {
    // First, check if in users.
    var ugroup = "default";
    if(config.users[from]) ugroup = config.users[from];
    else {
      // Get prefix
      if(util.isChannel(to)) {
        var channel = to.toLowerCase();
        var pre = _.find(whois.channels,function(tmp1) {
          var temp = _(tmp1.toLowerCase());
          if(temp.endsWith(channel)) return true;
          return false;
        }).substr(0,1);
        _.find(config.groups, function(group,key) {
          if(group.prefix == pre) { ugroup = key; return true; }
          return false;
        });
      }
    }
    var udata = config.groups[ugroup];
    if(udata.commands == "*") cb(true);
    else if(_(udata.commands).contains(cmdName)) cb(true);
    else cb(false);
  });
}
