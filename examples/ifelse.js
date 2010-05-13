var jazz = require("../lib/jazz");
var sys = require("sys");
var fs = require("fs");

var data = fs.readFileSync(__dirname + "/ifelse.jazz");
var template = jazz.compile(data);

//
// Render the template three times with different inputs
//

sys.print(template.eval({
  "firstVar": "MONKEYS!"
}));

sys.print(template.eval({
  "secondVar": "GIBBONS!"
}));

sys.print(template.eval({}));

