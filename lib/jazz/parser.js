/*
 *  jazz -- A simple template engine for nodejs
 *  Copyright (C) 2010 Shine Technologies
 */

var tokens = require("./tokens");
var ast = require("./ast");
var scanner = require("./scanner");
var error = require("./error");

function Parser(scanner) {
  this.scanner = scanner;
  this.globals = [];
  this.debug = false;
  this.locals = [];
  this.localsStack = [];
  return this;
}

Parser.prototype.peek = function() {
  if (this.nextToken) return this.nextToken;
  this.nextToken = this.scanner.next();
  return this.nextToken;
}

Parser.prototype.next = function() {
  if (!this.nextToken) this.nextToken = this.scanner.next();
  this.currentToken = this.nextToken;
  delete this.nextToken;
  return this.currentToken;
}

Parser.prototype.current = function() {
  return this.currentToken;
}

Parser.prototype.parse = function() {
  this.next(); // read first token
  var suite = this._parseSuite();
  this._check(tokens.EOF);
  if (this.debug) console.log(suite.toString());
  return new ast.AST(suite, this.globals);
}

Parser.prototype._pushLocals = function() {
  this.localsStack.push(this.locals);
}

Parser.prototype._popLocals = function() {
  this.locals = this.localsStack.pop();
}

Parser.prototype._declareLocal = function(name) {
  if (!inArray(name, this.locals)) {
    this.locals.push(name);
  }
}

Parser.prototype._declareGlobal = function(name) {
  if (!inArray(name, this.globals)) {
    this.globals.push(name);
  }
}

Parser.prototype._isLocal = function(name) {
  return inArray(name, this.locals);
}

Parser.prototype._syntaxError = function(tok, message) {
  throw new error.SyntaxError(this.scanner.filename, tok.row, tok.col, message);
}

Parser.prototype._check = function(type) {
  var n = this.current();
  if (n.type != type) {
    this._syntaxError(n, "expected " + type + ", but got " + n.type);
  }
  return n;
}

Parser.prototype._expect = function(type) {
  this._check(type);
  return this.next();
}

Parser.prototype._parseExpr = function() {
  var result = this._parseComparisonExpr();
  if (this.current().type == tokens.AND) {
    this.next();
    result = new ast.And(result, this._parseExpr());
  }
  else if (this.current().type == tokens.OR) {
    this.next();
    result = new ast.Or(result, this._parseExpr());
  }
  return result;
}

Parser.prototype._parseComparisonExpr = function() {
  var result = this._parseSimpleExpr();

  if (this.current().type == tokens.EQ) {
    this.next();
    result = new ast.BinOp(result, this._parseComparisonExpr(), "==");
  }
  else if (this.current().type == tokens.NEQ) {
    this.next();
    result = new ast.BinOp(result, this._parseComparisonExpr(), "!=");
  }
  else if (this.current().type == tokens.GT) {
    this.next();
    result = new ast.BinOp(result, this._parseComparisonExpr(), ">");
  }

  return result;
}

Parser.prototype._parseSimpleExpr = function() {
  var result;
  if (this.current().type == tokens.NOT) {
    this.next();
    result = new ast.Not(this._parseSimpleExpr());
  }
  else if (this.current().type == '(') {
    this.next();
    result = this._parseExpr();
    this._expect(')');
  }
  else if (this.current().type == '{') {
    this.next();
    result = this._parseHash();
    this._expect('}');
  }
  else if (this.current().type == '@') {
    this.next();
    var expr = this._parseExpr();
    this.next();
    var args = this._parseArgumentList();
    this._expect(')');
    result =  new ast.SyncCall(expr, args);
  }
  else if (this.current().type == tokens.IDENT) {
    result = this._parseIdent();
    if (!this._isLocal(result.name)) {
      this._declareGlobal(result.name);
    }
    result = this._parseGetAttrList(result);
  }
  else if (this.current().type == tokens.STR) {
    var s = this._check(tokens.STR);
    this.next();
    result = new ast.Str(s.value);
  }
  else if (this.current().type == tokens.NUM) {
    var n = this._check(tokens.NUM);
    this.next();
    result = new ast.Num(n.value);
  }
  else if (this.current().type == tokens.BOOL) {
    var b = this._check(tokens.BOOL);
    this.next();
    result = new ast.Bool(b.value);
  }
  else if (this.current().type == tokens.EMPTY) {
    this.next();
    result = new ast.Empty(this._parseSimpleExpr());
  }
  else {
    this._syntaxError(
      this.current(),
      "expected expression, but got " + this.current().type
    );
  }

  return result;
}

Parser.prototype._parseGetAttrList = function(expr) {
  var result = expr;
  while (this.current().type == '.' || this.current().type == '[') {
    switch (this.current().type) {
        case '.':
        {
            this.next();
            result = new ast.GetAttr(result, this._parseIdent());
            break;
        }
        case '[':
        {
            this.next();
            result = new ast.GetAttr(result, this._parseSimpleExpr(), true);
            this._expect(']');
            break;
        }
    }
    
  }
  return result;
}

Parser.prototype._parseHash = function(expr) {
  var body = [];
  while (this.current().type != '}') {
    var key = this._parseSimpleExpr();
    this._expect(':');
    var value = this._parseExpr();
    body.push([key, value]);
    if (this.current().type == ',') this.next();
  }
  return new ast.Hash(body);
}

Parser.prototype._parseIdent = function() {
  var id = this._check(tokens.IDENT);
  this.next();
  return new ast.Ident(id.value);
}

function inArray(value, arr) {
  return arr.indexOf(value) >= 0;
}

Parser.prototype._parseSuite = function() {
  var body = [],
      more = true;
  while (more) {
    var c = this.current();
    switch (c.type) {
      case tokens.IF:
        {
          body.push(this._parseIfStmt());
          break;
        }
      case tokens.ECHO:
        {
          body.push(this._parseEcho());
          break;
        }
      case tokens.IDENT:
      case tokens.NUM:
      case tokens.STR:
      case tokens.BOOL:
      case tokens.NOT:
      case '(':
      case '@':
        {
          body.push(this._parseEchoExpr());
          break;
        }
      case tokens.FOREACH:
        {
          body.push(this._parseForEach());
          break;
        }
      default:
        more = false;
    }
  }
  return new ast.Suite(body);
}

Parser.prototype._parseIfStmt = function() {
  this._expect(tokens.IF);
  var expr = this._parseExpr();
  var suite = this._parseSuite();
  var root = new ast.IfStmt(expr, suite);
  var ref = root;
  while (this.current().type === tokens.ELIF) {
    this._expect(tokens.ELIF);
    ref.orelse = new ast.IfStmt(this._parseExpr(), this._parseSuite())
    ref = ref.orelse;
  }
  if (this.current().type === tokens.ELSE) {
    this._expect(tokens.ELSE);
    ref.orelse = this._parseSuite();
  }
  this._expect(tokens.END);
  return root;
}

Parser.prototype._parseEcho = function() {
  var value = this._check(tokens.ECHO).value;
  this.next();
  return new ast.Echo(new ast.Str(value))
}

Parser.prototype._parseEchoExpr = function() {
  var result = this._parseExpr();
  if (this.current().type == '(') {
    this.next();
    var args = this._parseArgumentList();
    this._expect(')');
    return new ast.Call(result, args);
  }
  else {
    return new ast.Echo(this._parseGetAttrList(result));
  }
}

Parser.prototype._parseArgumentList = function() {
  if (this.current().type == ')') return [];
  var args = [];
  for (;;) {
    var expr = this._parseExpr();
    args.push(expr);
    if (this.current().type != ',') break;
    this.next();
  }
  return args;
}

Parser.prototype._parseForEach = function() {
  this._pushLocals();
  this._expect(tokens.FOREACH);
  var ident = this._parseIdent();
  this._declareLocal(ident.name);
  this._expect(tokens.IN);
  var expr = this._parseExpr();
  var suite = this._parseSuite();
  this._expect(tokens.END);
  this._popLocals();
  return new ast.ForEach(ident, expr, suite);
}

exports.createParser = function(scanner) {
  return new Parser(scanner);
}
