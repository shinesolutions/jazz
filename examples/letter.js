var jazz = require("../lib/jazz");
var fs = require("fs");

var data = fs.readFileSync(__dirname + "/letter.jazz", "utf8");
var template = jazz.compile(data);
template.eval({
    "recipient":"Tom",
    "friendly":true,
    "amount":"200.00",
    "company": "Gimme, Inc."
}, function(data) { console.log(data); });
