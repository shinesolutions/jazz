var assert = require("assert");
var jazz = require("../lib/jazz");
var sys = require("sys");

var testCases = [
  ["Hello, World",
    [{}, "Hello, World"]],
  ["Hello, {name}",
    [{name: "Tom"}, "Hello, Tom"]],
  ["Hello, {if name}{name}{end}",
    [{}, "Hello, "],
    [{name: "Tom"}, "Hello, Tom"]],
  ["Hello, {if name}{name}{else}Anonymous{end}",
    [{}, "Hello, Anonymous"],
    [{name: "Tom"}, "Hello, Tom"]],
  ["Hello, {if firstName}{firstName}{elif lastName}Mr. {lastName}{else}Anonymous{end}",
    [{}, "Hello, Anonymous"],
    [{firstName: "Tom"}, "Hello, Tom"],
    [{lastName: "Lee"}, "Hello, Mr. Lee"]],
  ["Hello, {if firstName}{firstName}{elif lastName}Mr. {lastName}{elif nickName}{nickName}{else}Anonymous{end}",
    [{}, "Hello, Anonymous"],
    [{firstName: "Tom"}, "Hello, Tom"],
    [{lastName: "Lee"}, "Hello, Mr. Lee"],
    [{nickName: "Steve"}, "Hello, Steve"],
    [{lastName: "Lee", nickName: "Steve"}, "Hello, Mr. Lee"]],
  ["Hello, {if firstName}{firstName}{elif lastName}Mr. {lastName}{end}",
    [{}, "Hello, "],
    [{firstName: "Tom"}, "Hello, Tom"],
    [{lastName: "Lee"}, "Hello, Mr. Lee"]],
  ["{foreach user in users}{user}\n{end}",
    [{users: ["tom", "ben", "stan"]}, "tom\nben\nstan\n"]],
  ["{foreach i in outer}{i}\n{foreach j in inner}  {j}\n{end}{end}",
    [{"outer": [1, 2, 3], "inner": [4, 5, 6]}, "1\n  4\n  5\n  6\n2\n  4\n  5\n  6\n3\n  4\n  5\n  6\n"]],
  ["Hey,\nNice socks. Mind if I borrow them?\n\r",
    [{}, "Hey,\nNice socks. Mind if I borrow them?\n\r"]],
  ["Testing \"Quotes\" y'see",
    [{}, "Testing \"Quotes\" y'see"]],
  ["{user.name}",
    [{"user": {"name": "Tom"}}, "Tom"]],
  ["{foreach friend in user.friends}{friend}\n{end}",
    [{"user": {"friends": ["Bob", "Bert", "Benita"]}}, "Bob\nBert\nBenita\n"]],
  ["{if user.active}ACTIVE{else}INACTIVE{end}",
    [{"user": {"active": true}}, "ACTIVE"],
    [{"user": {"active": false}}, "INACTIVE"]],
  ["{if user.active}{user.name} is ACTIVE{else}{user.name} is INACTIVE{end}",
    [{"user": {"active": true, "name": "Tom"}}, "Tom is ACTIVE"],
    [{"user": {"active": false, "name": "Steve"}}, "Steve is INACTIVE"]],
  ["{foo()}",
    [{foo: function(cb) { cb("Hello!"); }}, "Hello!", {"parser:debug": true, "compiler:debug": true}]]
];

testCases.forEach(function(testCase) {
  var source = testCase[0];
  var tests = testCase.slice(1);
  for (var i = 0; i < tests.length; i++) {
    var params = tests[i][0] || {};
    var expected = tests[i][1] || "";
    var options = tests[i][2] || {};

    var template = jazz.compile(source, options);
    template.eval(params, function(output) {
      assert.equal(output, expected);
    });
  }
});

sys.puts("OK!");

