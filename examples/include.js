var jazz = require("../lib/jazz");
var sys = require("sys");
var fs = require("fs");

var data = fs.readFileSync(__dirname + "/include_main.jazz");
var template = jazz.compile(data);
var params = {
  "include": function(filename, cb) {
    var tpl = jazz.compile(fs.readFileSync(__dirname + "/" + filename));
    tpl.eval(params, cb);
  }
};

template.eval(params, function(data) { sys.puts(data); });

