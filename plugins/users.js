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

exports.onLoad = function(c,u) {
  config = c; util = u;
  if(!config.groups) return false;
  return true;
}
exports.onCommand = function(from,to,cmdName,cmd,cb) {
  // Get user level
  util.client.whois(from, function(whois) {
    // First, check if in users.
    var ugroup = "default";
    if(config.users && config.users[from]) ugroup = config.users[from];
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
    var result = false;
    if(udata.commands || udata.whitelist) {
      var c = udata.commands || udata.whitelist;
      if(c == "*") result = true;
      else if(_(c).contains(cmdName)) result = true;
    }
    console.log(udata);
    console.log(result);
    if(udata.blacklist && !(_(udata.blacklist).contains(cmdName)))
      result = true;
    cb(result);
  });
}
