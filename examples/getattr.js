var jazz = require("../lib/jazz");
var fs = require("fs");

var data = fs.readFileSync(__dirname + "/getattr.jazz", "utf8");
var template = jazz.compile(data);
template.eval({"user": {"email_addresses": ["bob@foo.com", "bleh@blah.com"]}}, function(data) { console.log(data); });

