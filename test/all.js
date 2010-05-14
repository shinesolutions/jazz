var unittest = require("./unittest");
var jazz = require("../lib/jazz");
var suite = new unittest.TestSuite();
var sys = require("sys");

suite.addTest("hello world", function() {
  var template = jazz.compile("Hello, World");
  template.eval({}, function(data) {
    unittest.assertEquals("Hello, World", data);
  });
});

suite.addTest("hello world with params", function() {
  var template = jazz.compile("Hello, {name}");
  template.eval({"name": "Tom"}, function(output) {
    unittest.assertEquals("Hello, Tom", output);
  });
});

suite.addTest("hello world with conditional execution", function() {
  var template = jazz.compile("Hello, {if name}{name}{end}");

  template.eval({}, function(output) {
    unittest.assertEquals("Hello, ", output);
  });

  template.eval({"name": "Bert"}, function(output) {
    unittest.assertEquals("Hello, Bert", output);
  });
});

suite.addTest("hello world with if/else", function() {
  var template = jazz.compile("Hello, {if name}{name}{else}Anonymous{end}");
  template.eval({}, function(output) {
    unittest.assertEquals("Hello, Anonymous", output);
  });

  template.eval({"name": "Bob"}, function(output) {
    unittest.assertEquals("Hello, Bob", output);
  });
});

suite.addTest("hello world with if/elif/else", function() {
  var template = jazz.compile("Hello, {if firstName}{firstName}{elif lastName}Mr. {lastName}{else}Anonymous{end}");
  template.eval({}, function(output) {
    unittest.assertEquals("Hello, Anonymous", output);
  });

  template.eval({"firstName": "Giddy"}, function(output) {
    unittest.assertEquals("Hello, Giddy", output);
  });

  template.eval({"lastName": "Giraffe"}, function(output) {
    unittest.assertEquals("Hello, Mr. Giraffe", output);
  });
});

suite.addTest("hello world with if/elif/elif/else", function() {
  var template = jazz.compile("Hello, {if firstName}{firstName}{elif lastName}Mr. {lastName}{elif nickName}{nickName}{else}Anonymous{end}");
  template.eval({}, function(output) {
    unittest.assertEquals("Hello, Anonymous", output);
  });

  template.eval({"firstName": "Ted"}, function(output) {
    unittest.assertEquals("Hello, Ted", output);
  });

  template.eval({"lastName": "Johnston"}, function(output) {
    unittest.assertEquals("Hello, Mr. Johnston", output);
  });

  template.eval({"nickName": "Teddy Bear"}, function(output) {
    unittest.assertEquals("Hello, Teddy Bear", output);
  });

  template.eval({"lastName": "Smith", "nickName": "Error"}, function(output) {
    unittest.assertEquals("Hello, Mr. Smith", output);
  });
});

suite.addTest("hello world with if/elif (no else)", function() {
  var template = jazz.compile("{if displayGreeting}Hello{elif shun}Shoo! Away with you!{end}");
  template.eval({}, function(output) {
    unittest.assertEquals("", output);
  });

  template.eval({"displayGreeting": true}, function(output) {
    unittest.assertEquals("Hello", output);
  });

  template.eval({"shun": true}, function(output) {
    unittest.assertEquals("Shoo! Away with you!", output);
  });
});

suite.addTest("basic usage of foreach", function() {
  var template = jazz.compile("{foreach user in users}{user}\n{end}");
  template.eval({"users": ["tom", "ben", "stan"]}, function(output) {
    unittest.assertEquals("tom\nben\nstan\n", output);
  });
});

suite.addTest("nested usage of foreach", function() {
  var template = jazz.compile("{foreach i in outer}{i}\n{foreach j in inner}  {j}\n{end}{end}");
  template.eval({"outer": [1, 2, 3], "inner": [4, 5, 6]}, function(output) {
    unittest.assertEquals("1\n  4\n  5\n  6\n2\n  4\n  5\n  6\n3\n  4\n  5\n  6\n", output);
  });
});

suite.addTest("handles line feeds and carriage returns", function() {
  var input = "Hey,\nNice socks. Mind if I borrow them?\n\r";
  var template = jazz.compile(input);
  template.eval({}, function(output) {
    // should come out untouched, with no exceptions thrown
    unittest.assertEquals(input, output);
  });
});

suite.addTest("handles quotes", function() {
  var input = "So I said \"Go away Johnson, nobody likes you any more\"";
  var template = jazz.compile(input);
  template.eval({}, function(output) {
    unittest.assertEquals(input, output);
  });
});

suite.addTest("basic usage of attribute access", function() {
  var input = "{user.name}";
  var template = jazz.compile(input);
  template.eval({"user": {"name": "Tom"}}, function(output) {
    unittest.assertEquals("Tom", output);
  });
});

suite.addTest("usage of attribute access in a foreach loop", function() {
  var input = "{foreach friend in user.friends}{friend}\n{end}";
  var template = jazz.compile(input);
  template.eval({"user": {"friends": ["Bob", "Bert", "Benita"]}}, function(output) {
    unittest.assertEquals("Bob\nBert\nBenita\n", output);
  });
});

suite.addTest("usage of attribute access in a conditional", function() {
  var input = "{if user.active}ACTIVE{else}INACTIVE{end}";
  var template = jazz.compile(input);
  template.eval({"user": {"active": true}}, function(output) {
    unittest.assertEquals("ACTIVE", output);
  });
  template.eval({"user": {"active": false}}, function(output) {
    unittest.assertEquals("INACTIVE", output);
  });

  input = "{if user.active}{user.name} is ACTIVE{else}{user.name} is INACTIVE{end}";
  template = jazz.compile(input);
  template.eval({"user": {"name": "tom", "active": true}}, function(output) {
    unittest.assertEquals("tom is ACTIVE", output);
  });
  template.eval({"user": {"name": "tom", "active": false}}, function(output) {
    unittest.assertEquals("tom is INACTIVE", output);
  });
});


/*
var input = "{html('something')}";
var template = jazz.compile(input);
template.eval({"html": function(value, generate) { generate(escapeHtml(value)); }});

function escapeHtml(value) {
  return value;
}
*/

suite.run();
suite.report();
process.loop();

