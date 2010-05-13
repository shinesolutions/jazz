/*
 *  jazz -- A simple template engine for nodejs
 *  Copyright (C) 2010 Shine Technologies
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License along
 *  with this program; if not, write to the Free Software Foundation, Inc.,
 *  51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

var sys = require("sys");
var scanner = require("./jazz/scanner");
var parser = require("./jazz/parser");
var compiler = require("./jazz/compiler");

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
  var suite = p.parse();
  var symtable = p.globals;
  return c.compile(suite, symtable);
}

