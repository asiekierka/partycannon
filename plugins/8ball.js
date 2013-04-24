exports.info = {
  shortname: "8ball",
  name: "Eight-ball",
  descrption: "Randomly answers questions.",
  version: "0.1"
}

var answers = ["Yes!", "Yes.", "No!", "No.", "Maybe?", "Maybe."];
var answersOr = ["The former.", "The former!", "Definitely the former.", "The latter.", "The latter!", "Definitely the latter."];
var config = null;
var util = null;
var _ = require("underscore");
exports.onLoad = function(conf,api) {
  config = conf; util = api; return true;
}
exports.commands = {};
exports.onHighlight = function(from, to, message) {
  var msgl = _.trim(message.toLowerCase());
  var isQuestion = (msgl.indexOf("?") !== -1);
  if(isQuestion) {
    var ans = from + ": " + answers[_.random(answers.length-1)];
    if(msgl.indexOf(" or ") !== -1)
      ans = from + ": " + answersOr[_.random(answersOr.length-1)];
    util.say(to,ans);
  }
}
