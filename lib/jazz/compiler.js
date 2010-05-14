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
var tokens = require("./tokens");
var ast = require("./ast");

function CompileError(filename, row, col, message) {
  this.filename = filename;
  this.row = row || "?";
  this.col = col || "?";
  this.message = message;
  return this;
}

CompileError.prototype.toString = function() {
  return this.filename + ":" +
          this.row.toString() + ":" +
          this.col.toString() + ": " +
          this.message.toString();
}

function Program(fn, symtable) {
  this.fn = fn;
  this.symtable = symtable;
}

Program.prototype.eval = function(namespace) {
  var args = this._namespaceToArgs(namespace);
  return this.fn.apply(this.fn, args);
}

Program.prototype._namespaceToArgs = function(namespace) {
  var args = [];
  for (var i = 0; i < this.symtable.length; i++) {
    args.push(namespace[this.symtable[i]]);
  }
  return args;
}

function Compiler_JS() {
  this.debug = false;
  this.nextVar = 0;
  return this;
}

Compiler_JS.prototype.compile = function(suite, symtable) {
  var code = this._prelude(symtable);
  code += this._compileSuite(suite);
  code += "return __jazz_output;\n";
  if (this.debug) sys.puts(code);
  return new Program(new Function(code), symtable);
}

Compiler_JS.prototype._prelude = function(symtable) {
  var code = "var __jazz_output = '';\n";
  for (var i = 0; i < symtable.length; i++) {
    code += "var " + symtable[i] + " = arguments[" + i + "];\n";
  }
  return code;
}

Compiler_JS.prototype._newVar = function() {
  var name = "__jazz_var" + this.nextVar;
  this.nextVar++;
  return name;
}

Compiler_JS.prototype._compileSuite = function(suite) {
  var code = "{";
  for (var i = 0; i < suite.body.length; i++) {
    code += this._compileStatement(suite.body[i]);
  }
  code += "}";
  return code;
}

Compiler_JS.prototype._compileStatement = function(stmt) {
  var code = "";
  if (stmt.constructor == ast.IfStmt) {
    code += this._compileIfStmt(stmt);
  }
  else if (stmt.constructor == ast.ForEach) {
    code += this._compileForEach(stmt);
  }
  else if (stmt.constructor == ast.Echo) {
    code += "__jazz_output += " + this._compileExpression(stmt.value) + ";\n";
  }
  else {
    throw new CompileError("!FIXME!", stmt.row, stmt.col, "unknown statement type: " + stmt.type);
  }
  return code;
}

Compiler_JS.prototype._compileIfStmt = function(stmt) {
  var code = "if (";
  code += this._compileExpression(stmt.expr);
  code += ") { ";
  code += this._compileSuite(stmt.suite);
  code += "} "
  if (stmt.orelse) {
    // XXX hack: should be a stmt
    if (stmt.orelse.type == "jazz.ast.Suite") {
      code += " else { " + this._compileSuite(stmt.orelse) + " }";
    }
    else {
      code += " else " + this._compileStatement(stmt.orelse);
    }
  }
  return code;
}

Compiler_JS.prototype._compileForEach = function(stmt) {
  var exprVar = this._newVar();
  var indexVar = this._newVar();
  var code = "var " + exprVar + " = " + this._compileExpression(stmt.expr) + ";\n";
  code += "for (var " + indexVar + " = 0; " + indexVar + " < " + exprVar + ".length; " + indexVar + "++) {\n";
  code += "var " + stmt.ident.name + " = " + exprVar + "[" + indexVar + "];\n";
  code += this._compileSuite(stmt.suite);
  code += "}\n";
  return code;
}

Compiler_JS.prototype._compileExpression = function(expr) {
  if (expr.constructor == ast.Ident) return expr.name;
  else if (expr.constructor == ast.GetAttr) {
    return "(" + this._compileExpression(expr.expr) + ")." + expr.id.name;
  }
  else if (expr.constructor == ast.Call) {
    return "(" + expr.id.name + "()" + ")";
  }
  else if (expr.constructor == String) {
      // XXX there MUST be a better way to 'escape' the string value
      return "\"" +
        expr.
            replace(/\r/g, "\\r").
            replace(/\n/g, "\\n").
            replace(/\t/g, "\\t").
            replace(/"/g, "\\\"") + "\"";
  }
  else throw new CompileError("!FIXME!", expr.row, expr.col, "unknown expression type: " + JSON.stringify(expr));
}

exports.createCompiler = function() {
  return new Compiler_JS();
}

exports.CompileError = CompileError;
