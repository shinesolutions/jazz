var jazz = require("../lib/jazz");
var sys = require("sys");
var fs = require("fs");

var data = fs.readFileSync(__dirname + "/getattr.jazz", "utf8");
var template = jazz.compile(data);
template.eval({"user": {"email_addresses": ["bob@foo.com", "bleh@blah.com"]}}, function(data) { sys.puts(data); });

