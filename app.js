var    _ = require("underscore")
  , JSON = require("JSON2")
  , argv = require("optimist").argv
  ,  irc = require("irc")
  ,async = require("async")
  , http = require("http")
  ,https = require("https")
  ,   qs = require("querystring");

_.str = require('underscore.string');
_.mixin(_.str.exports());

var client = null;
var commands = {};
var config = null;
var plugins = {};
var util = {};

util.isChannel = function(s) { return _.startsWith(s,"#"); }
util.time = function(){ return Math.round(new Date().getTime() / 1000); }
util.saySender = function(channel, sender, msgo) {
  var msg = _.prune(msgo, config.maxLength, " (PW)"); 
  if(sender == null) client.say(channel, msg);
  client.say(channel,sender+": "+msg);
}

function loadPlugins() {
  console.log("Loading plugins");
  plugins = [];
  _.each(config.plugins, function(pluginName) {
    var plugin = require("./plugins/"+pluginName);
    plugin.filename = pluginName;
    if(!plugin.commands) console.log("[+] " + pluginName);
    else console.log("[+] " + pluginName + " (Commands: "+_(plugin.commands).keys()+")");
    var cont = true;
    if(plugin.onLoad) cont = plugin.onLoad(config, util);
    if(cont) {
      console.log("Loaded!");
      plugins[plugin.info.shortname || pluginName] = plugin;
      _.each(plugin.commands, function(func, cmd) { commands[cmd] = plugin.commands[cmd]; });
    }
  });
  console.log("Currently loaded commands: " + _(commands).keys());
}

function loadConfig(loadPlugs) {
  if(loadPlugs) {
    console.log("Unloading plugins");
    _.each(plugins,function(plugin) {
      console.log("[-] "+plugin.filename);
      if(plugin.onUnload) plugin.onUnload();
      // Unload commands
      _.each(plugin.commands, function(func, cmd) { delete commands["cmd"]; });
    });
  }
  config = require("./config.json");
  if(loadPlugs) loadPlugins();
}

function parseCommand(msg) {
  var command = msg.split(" ");
  command[0] = command[0].toLowerCase();
  if(_.startsWith(command[0],config.prefix)) // Prefixed
    command[0] = command[0].substr(1);
  else if(_.startsWith(command[0],config.nickname.toLowerCase())) // Called
    command.shift();
  else return null;
  command[0] = command[0].toLowerCase();
  return command;
}

function getCommandName(src) {
  var distances = _.chain(_(commands).functions()).map(function(name) {
    return {n: name, l: _.levenshtein(src,name)};
  }).sortBy(function(n){ return n.l; }).value();
  var n = distances[0];
  if(n.l > config.maxDistance) return null;
  else return n.n;
}

function runCommand(from, to, cmd) {
  var cmdName = getCommandName(cmd.shift());
  if(!cmdName) return;
  onEvent("onCommand",[from,to,cmdName,cmd],function() { commands[cmdName](from,to,cmd); });
}

function onEvent(funcName,args,callback) {
  var cont = true;
  async.eachSeries(_(plugins).values(),function(plugin,cb1){
    if(plugin[funcName])
      plugin[funcName].apply(plugin,_.flatten([args,function(cont){
        if(cont !== false) cb1();
      }],true));
    else cb1();
  },function(){callback();});
}

function reply(from, to, message) {
  if(!util.isChannel(to)) return;
  onEvent("onMessage",[from,to,message],function(){
    var cmd = parseCommand(message);
    if(cmd) runCommand(from,to,cmd);
  });
}

commands.reload = function(sender,target,args) {
  loadConfig(true);
  util.saySender(target,sender,"Config reloaded!");
}
commands.bestpony = function(sender,target,args) {
  util.saySender(target,sender,"Serenity is best pony <3");
}

loadConfig(false);

client = new irc.Client(config.server, config.nickname, {
  channels: config.channels
});
util.say = _.bind(client.say,client);
util.send = _.bind(client.send,client);
util.client = client;

loadConfig(true);

client.addListener("message",reply);
