var jazz = require("../lib/jazz");
var fs = require("fs");

var data = fs.readFileSync(__dirname + "/ifelse.jazz", "utf8");
var template = jazz.compile(data);

//
// Render the template three times with different inputs
//

template.eval({
  "firstVar": "MONKEYS!"
}, function(data) { console.log(data); });

template.eval({
  "secondVar": "GIBBONS!"
}, function(data) { console.log(data); });

template.eval({}, function(data) { console.log(data); });

