exports.info = {
  shortname: "hugs",
  name: "Hugs!",
  descrption: "Gives hugs to people!",
  version: "0.1"
}

var config = null;
var util = null;
exports.onLoad = function(conf,api) {
  config = conf; util = api; return true;
}
exports.commands = {};
exports.commands.hug = function(sender, target, args, next) {
  if(args.length>0) // Hug someone else
    util.action(target,"hugs "+args[0]);
  else util.action(target,"hugs "+sender);
};
