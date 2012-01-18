var jazz = require("../lib/jazz");
var fs = require("fs");

var data = fs.readFileSync(__dirname + "/foreach_object.jazz", "utf8");
var template = jazz.compile(data);
template.eval({"doc": {
    "title": "First",
    "content": "Some content"
}}, function(data) { console.log(data); });

