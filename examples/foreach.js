var jazz = require("../lib/jazz");
var sys = require("sys");
var fs = require("fs");

var data = fs.readFileSync(__dirname + "/foreach.jazz");
var template = jazz.compile(data);
sys.puts(template.eval({"people": ["Tom", "Danny", "Steve"]}));
