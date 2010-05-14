var jazz = require("../lib/jazz");
var sys = require("sys");
var fs = require("fs");

var data = fs.readFileSync(__dirname + "/ifelse.jazz");
var template = jazz.compile(data);

//
// Render the template three times with different inputs
//

template.eval({
  "firstVar": "MONKEYS!"
}, function(data) { sys.print(data); });

template.eval({
  "secondVar": "GIBBONS!"
}, function(data) { sys.print(data); });

template.eval({}, function(data) { sys.print(data); });

