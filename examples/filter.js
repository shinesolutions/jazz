var jazz = require("../lib/jazz");
var fs = require("fs");

var data = fs.readFileSync(__dirname + "/filter.jazz", "utf8");
var template = jazz.compile(data);
template.eval({
  "h": function(s, cb) {
    cb(s.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
  },
  "value": "<foo!>"
}, function(data) { console.log(data); });



