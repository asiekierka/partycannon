var    _ = require("underscore")
  ,   fs = require("fs")
  , JSON = require("JSON2")
  , argv = require("optimist").argv
  ,  irc = require("irc")
  ,async = require("async")
  , http = require("http")
  ,https = require("https")
  ,   qs = require("querystring");

_.str = require('underscore.string');
_.mixin(_.str.exports());

var punctuation = [".",",",":",";","?","!"];

var client = null;
var commands = {};
var config = null;
var plugins = {};
var util = {};
var global = {};
global.plugins = {};
global.channels = {};

util.parseLanguage = function(conf,languages) {
  var lt = _.defaults(languages[conf.language],languages["en"]) || {};
  return lt;
}
util.isChannel = function(s) { return _.startsWith(s,"#"); }
util.time = function(){ return Math.round(new Date().getTime() / 1000); }
util.saySender = function(channel, sender, msgo) {
  var msg = _.prune(msgo, config.maxLength, " (PW)"); 
  if(sender == null) client.say(channel, msg);
  client.say(channel,sender+": "+msg);
}

util.addCommand = function(cmd, handler) {
  var c = _(commands[cmd]);
  if(!c.isArray()) commands[cmd] = [];
  commands[cmd].push(handler);
}

util.deleteCommand = function(cmd, handler) {
  commands[cmd] = _(commands[cmd]).without(handler);
  if(commands[cmd].length == 0) delete commands[cmd];
}

function loadPlugins() {
  console.log("Loading plugins");
  plugins = [];
  _.each(config.plugins, function(pluginName) {
    var plugin = require("./plugins/"+pluginName);
    plugin.filename = pluginName;
    var cont = true;
    if(plugin.onLoad) cont = plugin.onLoad(config, util);
    if(cont) {
      if(!plugin.commands) console.log("[+] " + pluginName);
      else console.log("[+] " + pluginName + " (Commands: "+_(plugin.commands).keys()+")");
      global.plugins[plugin.info.shortname] = {};
      plugins[plugin.info.shortname] = plugin;
      _.each(plugin.commands, function(func,cmd){ util.addCommand(cmd,func); });
    }
  });
  console.log("Currently loaded commands: " + _(commands).keys().join(", "));
}

function loadConfig(loadPlugs) {
  if(loadPlugs) {
    console.log("Unloading plugins");
    _.each(plugins,function(plugin) {
      console.log("[-] "+plugin.filename);
      if(plugin.onUnload) plugin.onUnload();
      delete global.plugins[plugin.info.shortname];
      delete require.cache[require.resolve("./plugins/"+plugin.filename)];
      // Unload commands
      _.each(plugin.commands, function(func,cmd){ util.deleteCommand(cmd,func); });
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

function getCommandNames(src) {
  var functions = _(commands).keys();
  var distances = _.chain(functions).map(function(name) {
    return {n: name, l: _.levenshtein(src,name)};
  }).sortBy(function(n){ return n.l; }).value();
  if(distances[0].l > config.maxDistance) return null;
  if(distances[0].l > 0 && distances[0].n.length < config.minDistanceCmdLength) return null;
  else return _(distances).pluck("n");
}

function runCommand(from, to, cmd) {
  var cmdNames = getCommandNames(cmd.shift());
  if(!cmdNames) return;
  async.eachSeries(cmdNames,function(cmdName,next){
    if(!commands[cmdName]) return;
    onEvent("onCommand",[from,to,cmdName,cmd],function() {
      async.eachSeries(commands[cmdName],function(command,next2){
        command(from,to,cmd,next2);
      },next);
    });
  });
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

function command(from, to, message) {
  var cmd = parseCommand(message);
  if(cmd) runCommand(from,to,cmd);
}
function reply(from, to, message) {
  if(!util.isChannel(to)) return;
  onEvent("onMessage",[from,to,message],function(){
    if(_.find(punctuation,function(p){
      return _(message.toLowerCase()).startsWith(config.nickname.toLowerCase()+p);
    })) {
      var outmsg = _.trim(message.substr(config.nickname.length+1));
      onEvent("onHighlight",[from,to,message],function(){});
    } else command(from,to,message);
  });
}

function onAction(from, to, message) {
  onEvent("onAction",[from,to,message],function(){});
}

commands.reload = [function(sender,target,args) {
  loadConfig(true);
  util.saySender(target,sender,"Config reloaded!");
}];

commands.plugins = [function(sender,target,args) {
  var list = _(plugins).keys().join(", ");
  util.saySender(target,sender,"Plugins: " + list);
}];

commands.bestpony = [function(sender,target,args,next) {
  util.saySender(target,sender,"Fluttershy is best pony!");
}];

commands.commands = [function(sender,target,args,next) {
  var list = _(commands).keys().join(", ");
  util.saySender(target,sender,"Commands: " + list);  
}];

loadConfig(false);

client = new irc.Client(config.server, config.nickname, config.serverOptions);

_.each(config.channels,function(channel){ global.channels[channel] = {}; });

_.each(new Array("say","action","send","join","part","list","ctcp"),
  function(v) {
    util[v] = _.bind(client[v],client);
  }
);
util.client = client;
util.global = global;

loadConfig(true);

client.addListener("message",reply);
client.addListener("action",onAction);

client.addListener('error', function(message) {
    console.error('ERROR: %s: %s', message.command, message.args.join(' '));
});
