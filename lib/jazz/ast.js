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

function Call(id) {
  this.id = id;
  return this;
}

Call.prototype.toString = function() {
  return "Call(" + this.id.toString() + ")";
}

exports.Suite  = Suite;
exports.Ident  = Ident;
exports.IfStmt = IfStmt;
exports.Echo   = Echo;
exports.ForEach = ForEach;
exports.GetAttr = GetAttr;
exports.Call    = Call;
