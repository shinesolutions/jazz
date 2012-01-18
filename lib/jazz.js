/*
 *  jazz -- A simple template engine for nodejs
 *  Copyright (c) 2010 Shine Technologies
 */

var scanner = require("./jazz/scanner");
var parser = require("./jazz/parser");
var compiler = require("./jazz/compiler");
var error = require("./jazz/error");

exports.SyntaxError = error.SyntaxError;

exports.createScanner = scanner.createScanner;

exports.createParser = parser.createParser;

exports.createCompiler = compiler.createCompiler;

exports.compile = function(source, options) {
  options = options || {};
  var s = scanner.createScanner(source, options["filename"]);
  var p = parser.createParser(s);
  p.debug = options["parser:debug"] || false;
  var c = compiler.createCompiler();
  c.debug = options["compiler:debug"] || false;
  var parsed = p.parse();
  return c.compile(parsed);
}

