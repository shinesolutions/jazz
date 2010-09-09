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

function GetAttr(expr, id) {
  this.expr = expr;
  this.id = id;
  return this;
}

GetAttr.prototype.toString = function() {
  return "GetAttr(" + this.expr.toString() + ", " + this.id.toString() + ")";
}

function Call(expr, args) {
  this.expr = expr;
  this.args = args;
  return this;
}

Call.prototype.toString = function() {
  return "Call(" + this.id.toString() + ", " + _arrayToString(this.args) + ")";
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
  return "[" + arr.map(function(item) { return item.toString(); }).join(", ") + "]";
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
  return "Hash(" + this.body.map(function(stmt) { return stmt.toString(); }).join(", ") + ")";
}

function KeyValueSeparator() {
  this.value = ':';
  return this;
}

KeyValueSeparator.prototype.toString = function() {
  return "KeyValueSeparator(" + this.value + ")";
}

exports.Suite  = Suite;
exports.Ident  = Ident;
exports.IfStmt = IfStmt;
exports.Echo   = Echo;
exports.ForEach = ForEach;
exports.GetAttr = GetAttr;
exports.Call    = Call;
exports.Str     = Str;
exports.Num     = Num;
exports.Or      = Or;
exports.And     = And;
exports.Not     = Not;
exports.Empty	= Empty;
exports.BinOp   = BinOp;
exports.AST     = AST;
exports.Hash	= Hash;
exports.KeyValueSeparator = KeyValueSeparator;

