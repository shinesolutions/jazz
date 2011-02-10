var jazz = require("../lib/jazz");
var sys = require("sys");
var fs = require("fs");

var data = fs.readFileSync(__dirname + "/foreach_object.jazz", "utf8");
var template = jazz.compile(data);
template.eval({"doc": {
    "title": "First",
    "content": "Some content"
}}, function(data) { sys.puts(data); });

