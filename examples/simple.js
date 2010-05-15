var jazz = require("../lib/jazz");
var sys = require("sys");
var fs = require("fs");

var data = fs.readFileSync(__dirname + "/simple.jazz");
var template = jazz.compile(data, {"compiler:debug": true});
template.eval({}, function(data) { sys.puts("narf?"); sys.puts(data); });


