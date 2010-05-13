var unittest = require("./unittest");
var jazz = require("../lib/jazz");
var suite = new unittest.TestSuite();
var sys = require("sys");

suite.addTest("hello world", function() {
  var template = jazz.compile("Hello, World");
  var output = template.eval({});
  unittest.assertEquals("Hello, World", output);
});

suite.addTest("hello world with params", function() {
  var template = jazz.compile("Hello, {name}");
  var output = template.eval({"name": "Tom"});
  unittest.assertEquals("Hello, Tom", output);
});

suite.addTest("hello world with conditional execution", function() {
  var template = jazz.compile("Hello, {if name}{name}{end}");

  var output = template.eval({});
  unittest.assertEquals("Hello, ", output);

  output = template.eval({"name": "Bert"});
  unittest.assertEquals("Hello, Bert", output);
});

suite.addTest("hello world with if/else", function() {
  var template = jazz.compile("Hello, {if name}{name}{else}Anonymous{end}");
  var output = template.eval({});
  unittest.assertEquals("Hello, Anonymous", output);

  output = template.eval({"name": "Bob"});
  unittest.assertEquals("Hello, Bob", output);
});

suite.addTest("hello world with if/elif/else", function() {
  var template = jazz.compile("Hello, {if firstName}{firstName}{elif lastName}Mr. {lastName}{else}Anonymous{end}");
  var output = template.eval({});
  unittest.assertEquals("Hello, Anonymous", output);

  output = template.eval({"firstName": "Giddy"});
  unittest.assertEquals("Hello, Giddy", output);

  output = template.eval({"lastName": "Giraffe"});
  unittest.assertEquals("Hello, Mr. Giraffe", output);
});

suite.addTest("hello world with if/elif/elif/else", function() {
  var template = jazz.compile("Hello, {if firstName}{firstName}{elif lastName}Mr. {lastName}{elif nickName}{nickName}{else}Anonymous{end}");
  var output = template.eval({});
  unittest.assertEquals("Hello, Anonymous", output);

  output = template.eval({"firstName": "Ted"});
  unittest.assertEquals("Hello, Ted", output);

  output = template.eval({"lastName": "Johnston"});
  unittest.assertEquals("Hello, Mr. Johnston", output);

  output = template.eval({"nickName": "Teddy Bear"});
  unittest.assertEquals("Hello, Teddy Bear", output);

  output = template.eval({"lastName": "Smith", "nickName": "Error"});
  unittest.assertEquals("Hello, Mr. Smith", output);
});

suite.addTest("hello world with if/elif (no else)", function() {
  var template = jazz.compile("{if displayGreeting}Hello{elif shun}Shoo! Away with you!{end}");
  var output = template.eval({});
  unittest.assertEquals("", output);

  output = template.eval({"displayGreeting": true});
  unittest.assertEquals("Hello", output);

  output = template.eval({"shun": true});
  unittest.assertEquals("Shoo! Away with you!", output);
});

suite.addTest("basic usage of foreach", function() {
  var template = jazz.compile("{foreach user in users}{user}\n{end}");
  var output = template.eval({"users": ["tom", "ben", "stan"]});
  unittest.assertEquals("tom\nben\nstan\n", output);
});

suite.addTest("nested usage of foreach", function() {
  var template = jazz.compile("{foreach i in outer}{i}\n{foreach j in inner}  {j}\n{end}{end}");
  var output = template.eval({"outer": [1, 2, 3], "inner": [4, 5, 6]});
  unittest.assertEquals("1\n  4\n  5\n  6\n2\n  4\n  5\n  6\n3\n  4\n  5\n  6\n", output);
});

suite.addTest("handles line feeds and carriage returns", function() {
  var input = "Hey,\nNice socks. Mind if I borrow them?\n\r";
  var template = jazz.compile(input);
  var output = template.eval({});
  // should come out untouched, with no exceptions thrown
  unittest.assertEquals(input, output);
});

suite.addTest("handles quotes", function() {
  var input = "So I said \"Go away Johnson, nobody likes you any more\"";
  var template = jazz.compile(input);
  var output = template.eval({});
  unittest.assertEquals(input, output);
});

suite.addTest("basic usage of attribute access", function() {
  var input = "{user.name}";
  var template = jazz.compile(input);
  var output = template.eval({"user": {"name": "Tom"}});
  unittest.assertEquals("Tom", output);
});

suite.addTest("usage of attribute access in a foreach loop", function() {
  var input = "{foreach friend in user.friends}{friend}\n{end}";
  var template = jazz.compile(input);
  var output = template.eval({"user": {"friends": ["Bob", "Bert", "Benita"]}});
  unittest.assertEquals("Bob\nBert\nBenita\n", output);
});

suite.addTest("usage of attribute access in a conditional", function() {
  var input = "{if user.active}ACTIVE{else}INACTIVE{end}";
  var template = jazz.compile(input);
  var output = template.eval({"user": {"active": true}});
  unittest.assertEquals("ACTIVE", output);
  output = template.eval({"user": {"active": false}});
  unittest.assertEquals("INACTIVE", output);

  input = "{if user.active}{user.name} is ACTIVE{else}{user.name} is INACTIVE{end}";
  template = jazz.compile(input);
  output = template.eval({"user": {"name": "tom", "active": true}});
  unittest.assertEquals("tom is ACTIVE", output);
  output = template.eval({"user": {"name": "tom", "active": false}});
  unittest.assertEquals("tom is INACTIVE", output);
});

suite.run();
suite.report();

