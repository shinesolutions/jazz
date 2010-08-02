var jazz = require("../lib/jazz");
var sys = require("sys");
var fs = require("fs");

var data = fs.readFileSync(__dirname + "/html.jazz", "utf8");
var template = jazz.compile(data);

template.eval({"username": ""}, function(data) { sys.puts(data); });

template.eval({
  "errors": ["Invalid username", "Please try again"],
  "username": "bert"
}, function(data) { sys.puts(data); });

