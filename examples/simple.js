var jazz = require("../lib/jazz");
var fs = require("fs");

var data = fs.readFileSync(__dirname + "/simple.jazz", "utf8");
var template = jazz.compile(data);
template.eval({}, function(data) { console.log(data); });


