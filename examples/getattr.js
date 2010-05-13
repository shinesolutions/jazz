var jazz = require("../lib/jazz");
var sys = require("sys");
var fs = require("fs");

var data = fs.readFileSync(__dirname + "/getattr.jazz");
var template = jazz.compile(data);
sys.puts(template.eval({"user": {"email_addresses": ["bob@foo.com", "bleh@blah.com"]}}));

