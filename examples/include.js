var jazz = require("../lib/jazz");
var fs = require("fs");

var data = fs.readFileSync(__dirname + "/include_main.jazz", "utf8");
var template = jazz.compile(data);
var params = {
  "include": function(filename, cb) {
    var tpl = jazz.compile(fs.readFileSync(__dirname + "/" + filename, "utf8"));
    tpl.eval(params, cb);
  }
};

template.eval(params, function(data) { console.log(data); });

