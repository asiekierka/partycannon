exports.info = {
  shortname: "8ball",
  name: "Eight-ball",
  descrption: "Randomly answers questions.",
  version: "0.1"
}

var languages = {
  "en": {
    answers: ["Yes!", "Yes.", "No!", "No.", "Maybe?", "Maybe."],
    answersOr: ["The former.", "The former!", "Definitely the former.", "The latter.", "The latter!", "Definitely the latter."],
    orWord: [" or "]
  },
  "pl": {
    answers: ["Tak!", "Tak.", "Nie!", "Nie.", "Może?", "Może."],
    answersOr: ["To pierwsze.", "To pierwsze!", "Raczej to pierwsze.", "To drugie!", "To drugie.", "Raczej to drugie."],
    orWord: [" lub ", " albo "]
  }
}
var language = {};
var config = null;
var util = null;
var _ = require("underscore");
exports.onLoad = function(conf,api) {
  config = conf; util = api; language = api.parseLanguage(conf,languages); return true;
}
exports.onHighlight = function(from, to, message) {
  var msgl = _.trim(message.toLowerCase());
  var isQuestion = (msgl.indexOf("?") !== -1);
  if(isQuestion) {
    var ans = from + ": " + language.answers[_.random(language.answers.length-1)];
    _.each(language.orWord, function(ow) {
      if(msgl.indexOf(ow) !== -1)
        ans = from + ": " + language.answersOr[_.random(language.answersOr.length-1)];
    });
    util.say(to,ans);
  }
}
