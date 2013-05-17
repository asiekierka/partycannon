exports.info = {
  shortname: "messenger",
  name: "Messenger",
  descrption: "Implements tell commands.",
  version: "0.1"
}

var _ = require("underscore")
  , fs = require("fs");

var config = null
  , util = null
  , global = null
  , messages = null;

exports.onLoad = function(c,u) {
  config = c; util = u; global = util.global;
  if(fs.existsSync("./messages.json")) {
    console.log("[Messenger] Loading messages.json");
    messages = JSON.parse(fs.readFileSync("./messages.json",{encoding: "utf8"})) || [];
  } else messages = [];
  global.messages = messages;
  return true;
}

var save = function() {
  console.log("[Messenger] Saving messages.json");
  fs.writeFileSync("./messages.json",(JSON.stringify(messages) || []));
}
var saveAsync = function() {
  console.log("[Messenger] Saving messages.json [async]");
  fs.writeFile("./messages.json",(JSON.stringify(messages) || []), function(){});
}

exports.onUnload = save;

function addMessage(source, target, channel, text, time) {
  var msg = {"source": source, "target": target, "channel": channel,
             "text": text, "time": (time || util.time())};
  messages.push(msg);
  return msg;
}

function getMessages(nick, channel) {
  var msgs = _.chain(messages)
              .where({"target": nick, "channel": channel})
              .filter(function(msg) { return msg.time < util.time(); })
              .value();
  messages = _.difference(messages, msgs);
  return msgs;
}

exports.commands = {};
exports.commands.tell = function(sender, target, args, next) {
  if(args.length < 2) {
    util.saySender(target, sender, "Not enough arguments!");
  } else {
    var nick = args.shift()
      , delay = 0;
    console.log(parseInt(nick));
    if(!_(parseInt(nick)).isNaN()) {
      delay = parseInt(nick);
      nick = args.shift();
    }
    addMessage(sender, nick, target, args.join(" "), util.time()+(delay*60));
    util.saySender(target, sender, "Message will be delivered to "+nick+(delay>0?(" in "+delay+" minutes!"):" as soon as possible!"));
    save();
  }
}

exports.onMessage = function(nick,to,msg,cb) {
  var msgs = getMessages(nick, to);
  if(msgs.length > 1) {
    util.saySender(to, nick, "You have received "+msgs.length+" messages:");
    var i = 0;
    _.each(msgs, function(msg) {
      i++;
      util.say(to, "("+i+"/"+msgs.length+") From "+msg.source+": "+msg.text);
    });
    saveAsync();
  } else if(msgs.length == 1) {
    var msg = msgs[0];
    util.saySender(to, nick, "You have received a message from "+msg.source+": "+msg.text);
    saveAsync();
  }
  cb(true);
}
