var sys = require("sys");

function AssertionError(message) {
  this.message = message;
  return this;
}

AssertionError.prototype.toString = function() {
  return "AssertionError: " + (this.message || "no message");
}

function TestSuite() {
  this.tests = [];
  this.failures = [];
  this.errors = [];
  this.passed = 0;
  return this;
}

TestSuite.prototype.error = function(name, err) {
  this.errors.push([name, err]);
}

TestSuite.prototype.failure = function(name, err) {
  this.failures.push([name, err]);
}

TestSuite.prototype.addTest = function(name, fn) {
  var me = this;
  var impl = function() {
    try {
      fn();
      me.passed++;
    }
    catch (err) {
      if (err.constructor == AssertionError) {
        me.failure(name, err);
      }
      else {
        me.error(name, err);
      }
    }
  }
  this.tests.push(impl);
}

TestSuite.prototype.run = function() {
  this.failures = [];
  this.errors = [];
  for (var i = 0; i < this.tests.length; i++) {
    var test = this.tests[i];
    test();
  }
  return this.errors.length == 0 && this.failures.length == 0;
}

TestSuite.prototype.report = function() {
  if (this.passed == this.tests.length) {
    sys.puts("\033[32mPASS\033[0m");
  }
  else {
    sys.puts("\033[31mFAIL\033[0m");

    var errors = this.errors;
    for (var i = 0; i < errors.length; i++) {
      sys.puts("\033[31m" + errors[i][0] + "\033[0m: " + errors[i][1]);
    }

    var failures = this.failures;
    for (var i = 0; i < failures.length; i++) {
      sys.puts("\033[34m" + failures[i][0] + "\033[0m: " + failures[i][1]);
    }
  }
}

exports.TestSuite = TestSuite;

exports.assertTrue = function(expr, message) {
  if (!expr)
    throw new AssertionError(message || "assertTrue() failed");
}

exports.assertEquals = function(a, b, message) {
  if (a != b)
    throw new AssertionError(message || ("expected \"" + a.toString() + "\", but got \"" + b.toString() + "\""));
}

