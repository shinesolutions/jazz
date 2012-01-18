var jazz = require("../lib/jazz");
var fs = require("fs");

var data = fs.readFileSync(__dirname + "/foreach.jazz", "utf8");
var template = jazz.compile(data);
template.eval({"people": ["Tom", "Danny", "Steve"]}, function(data) { console.log(data); });
