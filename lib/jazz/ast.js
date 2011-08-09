/*
 *  jazz -- A simple template engine for nodejs
 *  Copyright (C) 2010 Shine Technologies
 */

function AST(root, globals) {
  this.root = root;
  this.globals = globals;
  return this;
}

AST.prototype.toString = function() {
  return "AST(globals=" + _arrayToString(this.globals), + ", " +
    this.root.toString() + ")";
}

function Suite(body) {
  this.type = "jazz.ast.Suite";
  this.body = body;
  return this;
}

Suite.prototype.toString = function() {
  return "Suite(" + this.body.map(function(stmt) { return stmt.toString(); }).join(", ") + ")";
}

function Ident(name) {
  this.type = "jazz.ast.Ident";
  this.name = name;
  return this;
}

Ident.prototype.toString = function() {
  return "Ident(" + this.name + ")";
}

function IfStmt(expr, suite, orelse) {
  this.type = "jazz.ast.IfStmt";
  this.expr = expr;
  this.suite = suite;
  this.orelse = orelse;
  return this;
}

IfStmt.prototype.toString = function() {
  return "IfStmt(" + this.expr.toString() + ", " + this.suite.toString() + ", " + (this.orelse ? this.orelse.toString() : "null") + ")";
}

function ForEach(ident, expr, suite) {
  this.type = "jazz.ast.ForEach";
  this.ident = ident;
  this.expr = expr;
  this.suite = suite;
  return this;
}

ForEach.prototype.toString = function() {
  return "ForEach(" + this.ident.toString() + ", " + this.expr.toString() + ", " + this.suite.toString();
}

function Echo(value) {
  this.type = "jazz.ast.EchoStmt";
  this.value = value;
  return this;
}

Echo.prototype.toString = function() {
  return "Echo(" + this.value.toString() + ")";
}

function GetAttr(expr, id, array) {
  this.expr = expr;
  this.id = id;
  this.array = array;
  return this;
}

GetAttr.prototype.toString = function() {
  var id = this.array ? "[" + this.id.toString()  + "]" : this.id.toString();
  return "GetAttr(" + this.expr.toString() + ", " + id + ")";
}

function Call(expr, args) {
  this.expr = expr;
  this.args = args;
  return this;
}

Call.prototype.toString = function() {
  return "Call(" + (this.id ? this.id.toString() : 'undefined') + ", " + _arrayToString(this.args) + ")";
}

function Str(value) {
  this.value = value;
  return this;
}

Str.prototype.toString = function() {
  return "Str('" + this.value.replace(/'/g, "\\'") + "')";
}

function Num(value) {
  this.value = value;
  return this;
}

Num.prototype.toString = function() {
  return "Num(" + this.value + ")";
}

function Bool(value) {
  this.value = value;
  return this;
}

Bool.prototype.toString = function() {
  return "Bool(" + this.value + ")";
}

function And(left, right) {
  this.left = left;
  this.right = right;
  return this;
}

And.prototype.toString = function() {
  return "And(" + this.left.toString() + ", " + this.right.toString() + ")";
}

function Or(left, right) {
  this.left = left;
  this.right = right;
  return this;
}

Or.prototype.toString = function() {
  return "Or(" + this.left.toString() + ", " + this.right.toString() + ")";
}

function Not(expr) {
  this.expr = expr;
  return this;
}

Not.prototype.toString = function() {
  return "Not(" + this.expr.toString() + ")";
}

function BinOp(left, right, op) {
  this.left = left;
  this.right = right;
  this.op = op;
  return this;
}

BinOp.prototype.toString = function() {
  return "BinOp(" + this.left.toString() + ", " + this.op + ", " + this.right.toString() + ")";
}

function _arrayToString(arr) {
  return "[" + arr.map(function(item) { return item ? item.toString() : 'undefined'; }).join(", ") + "]";
}

function Empty(expr) {
  this.expr = expr;
  return this;
}

Empty.prototype.toString = function() {
  return "Empty(" + this.expr.toString() + ")";
}

function Hash(body) {
  this.body = body;
  return this;
}

Hash.prototype.toString = function() {
  return "Hash(" + this.body.map(function(kv) { return kv[0].toString() + ":" + kv[1].toString(); }).join(", ") + ")";
}

function SyncCall(expr, args) {
  this.expr = expr;
  this.args = args;
  return this;
}

SyncCall.prototype.toString = function() {
  return "SyncCall(" + (this.id ? this.id.toString() : 'undefined') + ", " + _arrayToString(this.args) + ")";
}

function GetArr(expr, index) {
  this.expr = expr;
  this.index = index;
  this.value = this;
  return this;
}

GetArr.prototype.toString = function() {
  return "GetArr(" + this.expr.toString() + ", " + this.index.toString() + ")";
}

exports.Suite  = Suite;
exports.Ident  = Ident;
exports.IfStmt = IfStmt;
exports.Echo   = Echo;
exports.ForEach = ForEach;
exports.GetAttr = GetAttr;
exports.Call    = Call;
exports.SyncCall = SyncCall;
exports.Str     = Str;
exports.Num     = Num;
exports.Bool    = Bool;
exports.Hash    = Hash;
exports.Or      = Or;
exports.And     = And;
exports.Not     = Not;
exports.Empty   = Empty;
exports.BinOp   = BinOp;
exports.AST     = AST;
exports.GetArr = GetArr;
