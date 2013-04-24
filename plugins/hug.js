exports.info = {
  shortname: "hugs",
  name: "Hugs!",
  descrption: "Gives hugs to people!",
  version: "0.2"
}

var hugTypes = [
  "hugs %s", "snuggles %s", "jumphugs %s", "nibbles %s's ear", "nuzzles %s", "kisses %s on the cheek"
];
var hugReactions = [
  "finds that adorable", "feels happier", "finds %s's action adorable", "hugs %s in return", "snuggles %s in return",
  "kisses %s on the cheek in return", "nuzzles %s in return", "surprise hugs %s in return"
];
var hugReactions2 = [
  ":3", "<3", "%s: Aww...", "%s: That's so cute!", "Thanks, %s!"
];
var config = null;
var util = null;
var _ = require("underscore");
exports.onLoad = function(conf,api) {
  config = conf; util = api; return true;
}
exports.commands = {};
exports.commands.hug = function(sender, target, args, next) {
  var hugTarget = sender;
  if(args.length>0) hugTarget = args[0];
  var hugMsg = hugTypes[_.random(hugTypes.length-1)].replace("%s",hugTarget);
  util.action(target,hugMsg);
};
exports.onAction = function(from, to, msgo) {
  var message = _.trim(msgo).toLowerCase();
  _.each(hugTypes,function(type) {
    var message2 = type.replace("%s",config.nickname);
    var message3 = type.replace(" %s","");
    if(_(message).startsWith(message2.toLowerCase()))
       || (_(message).startsWith(message3.toLowerCase()) && message.indexOf(config.nickname) !== -1) ) {
      if(Math.random() < 0.4) {
        var hugMsg = hugReactions[_.random(hugReactions.length-1)].replace("%s",from);
        util.action(to,hugMsg);
      } else {
        var hugMsg = hugReactions2[_.random(hugReactions2.length-1)].replace("%s",from);
        util.say(to,hugMsg);
      }
    }
  });
}
