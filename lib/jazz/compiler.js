/*
 *  jazz -- A simple template engine for nodejs
 *  Copyright (C) 2010 Shine Technologies
 */

var tokens = require("./tokens");
var ast = require("./ast");
var events = require("events");

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

function Program(fn, globals) {
  this.fn = fn;
  this.globals = globals;
}

/* Deprecated method for processing templates, renamed to 'process' to make jslint happy */
Program.prototype.eval = function(namespace, cb) {
  return this.process(namespace, cb);
}

Program.prototype.process = function(namespace, cb) {
  var args = [cb].concat(this._namespaceToArgs(namespace));
  return this.fn.apply(this.fn, args);
}

Program.prototype._namespaceToArgs = function(namespace) {
  var args = [];
  for (var i = 0; i < this.globals.length; i++) {
    args.push(namespace[this.globals[i]]);
  }
  return args;
}

function Compiler_JS() {
  this.debug = false;
  this.nextVar = 0;
  return this;
}

Compiler_JS.prototype._prologue = function(globals) {
  var code =  "";
  code += "(function() {\n";

  //
  // The result callback. We'll execute this function when we've finished
  // compiling and we have all expected output chunks.
  //
  code += "var __jazz_cb = arguments[0];\n";

  code += "var __jazz_emitter = new events.EventEmitter();\n";

  //
  // Indicates the number of chunks we expect to see by the time we've
  // finished compiling.
  //
  code += "var __jazz_expected = 0;\n"; // the number of expected chunks

  //
  // Indicates the number of chunks we've actually seen come back.
  // When __jazz_seen == __jazz_expected, we're done.
  //
  code += "var __jazz_seen     = 0;\n";

  //
  // The output buffer. Use an array because chunks can come back in any old order.
  //
  code += "var __jazz_output = [];\n";

  //
  // Set to true when the template has been executed. We may still be waiting
  // on async calls (see __jazz_check_complete()).
  //
  code += "var __jazz_ready = false;\n";

  //
  // This function is used to detect when any background process might have
  // completed. May be inefficient?
  //
  code += "function __jazz_check_complete() {\n";
  code += "  if (__jazz_ready && __jazz_expected == __jazz_seen) {\n";
  code += "    __jazz_cb(__jazz_output.join(''));\n";
  code += "  }\n";
  code += "}\n";

  code += "__jazz_emitter.addListener('data', function(pos, chunk) {\n";
  code += "  __jazz_output[pos] = chunk;\n";
  code += "  __jazz_seen++;\n";
  code += "  __jazz_check_complete();\n";
  code += "});\n";

  for (var i = 0; i < globals.length; i++) {
    var j = i + 1;
    code += "var " + globals[i] + " = arguments[" + j + "];\n";
  }
  return code;
}

Compiler_JS.prototype._epilogue = function() {
  var code = "";
  code += "__jazz_ready = true;\n";
  code += "__jazz_check_complete();\n";
  code += "})";
  return code;
}

Compiler_JS.prototype.compile = function(ast) {
  var code = this._prologue(ast.globals);
  code += this._compileSuite(ast.root);
  code += this._epilogue();
  if (this.debug) console.log(code);
  return new Program(eval(code), ast.globals);
}

Compiler_JS.prototype._newVar = function() {
  var name = "__jazz_var" + this.nextVar;
  this.nextVar++;
  return name;
}

Compiler_JS.prototype._compileSuite = function(suite) {
  var code = "{\n";
  for (var i = 0; i < suite.body.length; i++) {
    code += this._compileStatement(suite.body[i]);
  }
  code += "}\n";
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
    code += this._compileEcho(stmt);
  }
  else if (stmt.constructor == ast.Call) {
    code += this._compileCall(stmt);
  }
  else if (stmt.constructor == ast.Suite) {
    code += this._compileSuite(stmt);
  }
  else if (stmt.constructor == ast.GetArr) {
    code += this._compileEcho(stmt);
  }
  else {
    throw new CompileError("!FIXME!", stmt.row, stmt.col, "unknown statement type: " + stmt.type);
  }
  return code;
}

Compiler_JS.prototype._compileEcho = function(stmt) {
  var code = "";

  var slotVar = this._newVar();
  code += "var " + slotVar + " = __jazz_expected++;\n";
  code += "__jazz_emitter.emit('data', " + slotVar + ", " + this._compileExpr(stmt.value) + ");\n";

  return code;
}

Compiler_JS.prototype._compileCall = function(stmt) {
  var code = "";

  var slotVar = this._newVar();
  code += "var " + slotVar + " = __jazz_expected++;\n";
  code += "(" + this._compileExpr(stmt.expr) + ")(";
  for (var i = 0; i < stmt.args.length; i++) {
    code += this._compileExpr(stmt.args[i]);
    code += ", ";
  }
  code += "function(data) { __jazz_emitter.emit('data', " + slotVar + ", data); });\n";

  return code;
}

Compiler_JS.prototype._compileIfStmt = function(stmt) {
  var code = "if (";
  code += this._compileExpr(stmt.expr);
  code += ") ";
  code += this._compileSuite(stmt.suite);
  if (stmt.orelse) {
    code += " else " + this._compileStatement(stmt.orelse);
  }
  return code;
}

Compiler_JS.prototype._compileForEach = function(stmt) {
  var exprVar = this._newVar();
  var indexVar = this._newVar();
  var lengthVar = this._newVar();
  var countVar = this._newVar();
  var code = "var " + exprVar + " = " + this._compileExpr(stmt.expr) + ";\n";

  // array syntax
  code += "if (" + exprVar + " instanceof Array) {\n";
  code += "var " + lengthVar + " = " + exprVar + " ? " + exprVar + ".length : 0;\n";
  code += "for (var " + indexVar + " = 0, " + countVar + " = 1; " + indexVar + " < " + lengthVar + "; " + indexVar + "++, " + countVar + "++) ";
  code += "(function() {\n";
  code += "  var __index = " + indexVar + ";\n";
  code += "  var __count = " + countVar + ";\n";
  code += "  var " + stmt.ident.name + " = " + exprVar + "[" + indexVar + "];\n";
  code += "  " + this._compileSuite(stmt.suite);
  code += "})();\n";
  code += "}\n"

  // object syntax
  code += "else {\n";
  code += "var " + countVar + " = 1;\n";
  code += "for (var " + indexVar + " in " + exprVar + ") ";
  code += "(function() {\n";
  code += "  if (" + exprVar + ".hasOwnProperty(" + indexVar + ")) {\n";
  code += "  var __index = " + indexVar + ";\n";
  code += "  var __count = " + countVar + ";\n";
  code += "  var " + stmt.ident.name + " = {'key': __index, 'value': " + exprVar + "[__index]};\n";
  code += "  " + this._compileSuite(stmt.suite) + "\n";
  code += "  " + countVar + "++;\n";
  code += "  }\n"
  code += "})();\n";
  code += "}\n";

  return code;
}

Compiler_JS.prototype._compileHash = function(hash) {
  var code = '{';
  var body = hash.body;
  for (var i = 0; i < body.length; i++) {
    var element = body[i];
    var key = element[0];
    var value = element[1];
    code += this._compileExpr(element[0]);
    code += ":";
    code += this._compileExpr(element[1]);
    if (i < body.length-1) code += ',';
  }
  code += '}';
  return code;
}

Compiler_JS.prototype._compileExpr = function(expr) {
  if (expr.constructor == ast.Ident) {
    return expr.name;
  }
  else if (expr.constructor == ast.GetAttr) {
    if (expr.array) {
        return "(" + this._compileExpr(expr.expr) + ")[" + this._compileExpr(expr.id) + "]";
    } else {
        return "(" + this._compileExpr(expr.expr) + ")." + this._compileExpr(expr.id);
    }
  }
  else if (expr.constructor == ast.And) {
    return "((" + this._compileExpr(expr.left) + ") && (" +
            this._compileExpr(expr.right) + "))";
  }
  else if (expr.constructor == ast.Or) {
    return "((" + this._compileExpr(expr.left) + ") || (" +
            this._compileExpr(expr.right) + "))";
  }
  else if (expr.constructor == ast.Not) {
    return "(!(" + this._compileExpr(expr.expr) + "))";
  }
  else if (expr.constructor == ast.BinOp) {
    return "((" + this._compileExpr(expr.left) + ")" + expr.op +
             "(" + this._compileExpr(expr.right) + "))";
  }
  else if (expr.constructor == ast.Str) {
    // XXX there MUST be a better way to 'escape' the string value
    return "\"" +
      expr.value.
          replace(/\r/g, "\\r").
          replace(/\n/g, "\\n").
          replace(/\t/g, "\\t").
          replace(/"/g, "\\\"") + "\"";
  }
  else if (expr.constructor == ast.Num) {
    return expr.value;
  }
  else if (expr.constructor == ast.Bool) {
    return expr.value;
  }
  else if (expr.constructor == ast.Empty) {
    var compiledExpr = this._compileExpr(expr.expr);
    var statement = "("
    statement += "!" + compiledExpr + " || ";
    statement += "(" + compiledExpr + " instanceof Array && " + compiledExpr + ".length == 0)";
    statement += ")";
    return statement;
  }
  else if (expr.constructor == ast.Hash) {
    return this._compileHash(expr);
  }
  else if (expr.constructor == ast.SyncCall) {
    var code = '', argsLength = expr.args.length;
    code += '(' + this._compileExpr(expr.expr) + ')(';
    for (var i = 0; i < argsLength; i++) {
      code += this._compileExpr(expr.args[i]);
      if (i !== argsLength-1) code += ', ';
    }
    code += ')';
    return code;
  }
  else if (expr.constructor == ast.GetArr) {
    return "(" + this._compileExpr(expr.expr) + ")[" + this._compileExpr(expr.index) + "]";
  }
  else {
    throw new CompileError("!FIXME!", expr.row, expr.col, "unknown expression type: " + JSON.stringify(expr));
  }
}

exports.createCompiler = function() {
  return new Compiler_JS();
}

exports.CompileError = CompileError;
