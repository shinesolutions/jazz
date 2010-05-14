var jazz = require("../lib/jazz");
var sys = require("sys");
var fs = require("fs");

var data = fs.readFileSync(__dirname + "/simple.jazz");
var template = jazz.compile(data, {"compiler:debug": true, "parser:debug": true});
template.evalSync({}, function(data) { sys.puts(data); });


