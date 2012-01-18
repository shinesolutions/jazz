var jazz = require("../lib/jazz");
var fs = require("fs");

var data = fs.readFileSync(__dirname + "/html.jazz", "utf8");
var template = jazz.compile(data);

template.eval({"username": ""}, function(data) { console.log(data); });

template.eval({
  "errors": ["Invalid username", "Please try again"],
  "username": "bert"
}, function(data) { console.log(data); });

