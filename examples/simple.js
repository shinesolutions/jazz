var jazz = require("../lib/jazz");
var sys = require("sys");
var fs = require("fs");

var data = fs.readFileSync(__dirname + "/simple.jazz", "utf8");
var template = jazz.compile(data);
template.eval({}, function(data) { sys.puts(data); });


