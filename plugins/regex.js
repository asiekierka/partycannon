// Requires pcre!
exports.info = {
  shortname: "regex",
  name: "Regexifier",
  descrption: "Perl regexes",
  version: "0.1"
}

var    _ = require("underscore");

var config = null;
var util = null;
var global = null;
exports.onLoad = function(conf,api) {
  config = conf; util = api; global = util.global;
  return true;
}

var sMatch = /^s\/(.*)\/(.*)\/([gimy]*)$/;

exports.commands = {};
exports.commands.regex = function(sender, target, args, next) {
  if(!global.channels[target].log) next();
  var regex = args.join(" ");
  var match = sMatch.exec(regex);
  if(match) {
    var r = new RegExp(match[1],match[3]);
    var msg = _.first(_.last(global.channels[target].log,2)).message;
    util.say(target,msg.replace(r,match[2]));
  }
};
