exports.info = {
  shortname: "8ball",
  name: "Eight-ball",
  descrption: "Randomly answers questions.",
  version: "0.1"
}

var languages = {
  "en": {
    answer: ["Yes!", "Yes.", "No!", "No.", "Maybe?", "Maybe."],
    answersOr: ["The former.", "The former!", "Definitely the former.", "The latter.", "The latter!", "Definitely the latter."]
  },
  "pl": {
    answer: ["Tak!", "Tak.", "Nie!", "Nie.", "Może?", "Może."],
    answersOr: ["To pierwsze.", "To pierwsze!", "Raczej to pierwsze.", "To drugie!", "To drugie.", "Raczej to drugie."]
  }
}
var language = {};
var config = null;
var util = null;
var _ = require("underscore");
exports.onLoad = function(conf,api) {
  config = conf; util = api; language = api.parseLanguage(conf,languages); return true;
}
exports.commands = {};
exports.onHighlight = function(from, to, message) {
  var msgl = _.trim(message.toLowerCase());
  var isQuestion = (msgl.indexOf("?") !== -1);
  if(isQuestion) {
    var ans = from + ": " + language.answers[_.random(language.answers.length-1)];
    if(msgl.indexOf(" or ") !== -1)
      ans = from + ": " + language.answersOr[_.random(language.answersOr.length-1)];
    util.say(to,ans);
  }
}
