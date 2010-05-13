var jazz = require("../lib/jazz");
var sys = require("sys");
var fs = require("fs");

var data = fs.readFileSync(__dirname + "/html.jazz");
var template = jazz.compile(data);

sys.puts(template.eval({"username": ""}));

sys.puts(template.eval({
  "errors": ["Invalid username", "Please try again"],
  "username": "bert"
}));

