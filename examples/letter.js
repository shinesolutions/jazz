var jazz = require("../lib/jazz");
var sys = require("sys");
var fs = require("fs");

var data = fs.readFileSync(__dirname + "/letter.jazz");
var template = jazz.compile(data);
template.eval({
    "recipient":"Tom",
    "friendly":true,
    "amount":"200.00",
    "company": "Gimme, Inc."
}, function(data) { sys.puts(data); });
