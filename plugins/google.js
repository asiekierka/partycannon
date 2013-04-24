exports.info = {
  shortname: "googlesearch",
  name: "Google Search",
  descrption: "Adds Google searching support",
  version: "0.1"
}

var    _ = require("underscore")
  , JSON = require("JSON2")
  , http = require("http")
  ,https = require("https")
  ,   qs = require("querystring");

_.str = require('underscore.string');
_.mixin(_.str.exports());

var languages = {
  "en": {
    "error": "Error",
    "noQuery": "No query given!",
    "noResults": "No results! Try something more known",
    "results": "Results",
    "resultsFor": "Results for"
   },
  "pl": {
    "error": "Błąd",
    "noQuery": "Brak zapytania!",
    "noResults": "Brak wyników!",
    "results": "Wyniki",
    "resultsFor": "Wyniki dla"
   }
}
var config = null;
var util = null;
var language = languages["en"];

exports.onLoad = function(conf,api) {
  config = conf; util = api; language = api.parseLanguage(conf,languages);
  if(config.apis.google && config.apis.googleCx) return true;
  return false;
}

exports.commands = {};
exports.commands.google = function(sender, target, args, next) {
  if(args.length == 0) { util.saySender(target,sender,language.noQuery); return; }
  var url = "https://www.googleapis.com/customsearch/v1?"
            + qs.stringify({key: config.apis.google,
                cx: config.apis.googleCx, alt: "json",
                q: args.join(" ")});
  console.log("Accessing " + url);
  https.get(url,function(res) {
    res.setEncoding('utf8');
    var data = "";
    res.on('data', function(c){data+=c;});
    res.on('end', function() {
      var ans = JSON.parse(data);
      if(ans.error) {
        util.saySender(target,sender,language.error+": "+ans.error.message);
        return;
      }
      var out = language.results+": ";
      var r = 0;
      _.each(ans.items,function(item){ r+=1;
        if(r>1) out += ", ";
        out += r + ". " + item.title + " [" + item.link + "]";
      });
      if(!ans.items || ans.items.length==0) out = language.noResults;
      util.saySender(target,sender,out);
      if(out.length > config.maxLength) { // PM!
        var r = 0;
        util.say(sender,language.resultsFor+" '"+args.join(" ")+"':");
        _.each(ans.items,function(item){ r+=1;
          util.say(sender, r + ". " + item.title + " [" + item.link + "]");
        });
      }
    });
  }).on('error', function(e) {
    util.saySender(target,sender,language.error+": " + e.message);
  });
};
