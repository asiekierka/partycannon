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

var config = null;
var util = null;

exports.onLoad = function(conf,api) {
  config = conf; util = api;
  if(config.apis.google && config.apis.googleCx) return true;
  return false;
}

exports.commands = {};
exports.commands.google = function(sender, target, args, next) {
  if(args.length == 0) { util.saySender(target,sender,"No query given!"); return; }
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
        util.saySender(target,sender,"Error: "+ans.error.message);
        return;
      }
      var out = "Results: ";
      var r = 0;
      _.each(ans.items,function(item){ r+=1;
        if(r>1) out += ", ";
        out += r + ". " + item.title + " [" + item.link + "]";
      });
      if(!ans.items || ans.items.length==0) out = "No results! Try something more known.";
      util.saySender(target,sender,out);
      if(out.length > config.maxLength) { // PM!
        var r = 0;
        util.say(sender,"Results for '"+args.join(" ")+"':");
        _.each(ans.items,function(item){ r+=1;
          util.say(sender, r + ". " + item.title + " [" + item.link + "]");
        });
      }
    });
  }).on('error', function(e) {
    util.saySender(target,sender,"Error: " + e.message);
  });
};
