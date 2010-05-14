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

var tokens = require("./tokens");

//
// XXX is this the right place for SyntaxError?
//
function SyntaxError(filename, row, col, message) {
  this.filename = filename;
  this.row = row || "?";
  this.col = col || "?";
  this.message = message;
  return this;
}

SyntaxError.prototype.toString = function() {
  return this.filename + ":" +
          this.row.toString() + ":" +
          this.col.toString() + ": " +
          this.message;
}

var STATE_ECHO = 0;
var STATE_CODE = 1;

function Scanner(source, filename) {
  filename = filename || "<unknown>";
  this.source = source;
  this.pos = 0;
  this.filename = filename;
  this.row = 1;
  this.col = 1;
  this.state = STATE_ECHO;
  return this;
}

Scanner.prototype.next = function() {
  if (this.state == STATE_ECHO) {
    return this._echoState();
  }
  else {
    return this._codeState();
  }
}

Scanner.prototype._syntaxError = function(message) {
  throw new SyntaxError(this.filename, this.row, this.col, message);
}

Scanner.prototype._unexpectedToken = function(token) {
  return this._syntaxError("unexpected token: '" + token + "'");
}

Scanner.prototype._echoState = function() {
  var row = this.row;
  var col = this.col;
  var i = this.pos;
  var j = i;
  var me = this;
  function step() {
    j++;
    me.col++;
  }
  var s = this.source;
  var value = "";
  while (j < s.length) {
    if (s[j] == '{') {
      if (j+1 < s.length && s[j+1] == '{') {
        // double brace -> brace literal
        value += "{";
        step();
      }
      else {
        this.state = STATE_CODE;
        break;
      }
    }
    else if (s[j] == '}') {
      if (j+1 < s.length && s[j+1] == '}') {
        // double brace -> brace literal
        value += "}";
        step();
      }
      else {
        this._unexpectedToken(s[j]);
      }
    }
    else if (s[j] == "\n") {
      this.col = 0; // step() will reset this to 1
      this.row++;
      value += s[j];
    }
    else {
      value += s[j];
    }
    step();
  }
  this.pos = j+1;
  if (value.length > 0) {
    return this._makeToken(tokens.ECHO, value, {row:row, col:col});
  }
  else if (this.pos >= s.length) {
    return this._makeToken(tokens.EOF);
  }
  else {
    return this.next();
  }
}

Scanner.prototype._makeToken = function(type, attrs, options) {
  var row, col;
  if (options) {
    row = typeof(options.row) == "undefined" ? this.row : options.row;
    col = typeof(options.col) == "undefined" ? this.col : options.col;
  }
  else {
    row = this.row;
    col = this.col;
  }
  var r = {type: type, row:row, col:col};
  if (typeof(attrs) == "string") {
    r.value = attrs;
  }
  else if (typeof(attrs) == "object") {
    for (var attr in attrs) {
      if (attrs.hasOwnProperty(attr)) {
        r[attr] = attrs[attr];
      }
    }
  }
  // else ignore it
  return r;
}

function isIdentChar(c) {
  if (typeof(c) == "undefined") return false;
  return (c >= 'a' && c <= 'z') ||
          (c >= 'A' && c <= 'Z') ||
          (c >= '0' && c <= '9') ||
          c == '_';
}

function keyword(name, s, i) {
  var j = i;
  while (j < s.length && j-i < name.length) {
    if (s[j] != name[j-i]) return false;
    j++;
  }
  if (isIdentChar(s[j])) return false;
  return true;
}

function ident(s, i) {
  var r = "";
  while (i < s.length) {
    if (isIdentChar(s[i])) {
      r += s[i];
    }
    else {
      break;
    }
    i++;
  }
  return r;
}

Scanner.prototype._codeState = function() {
  var i = this.pos;
  var s = this.source;
  var me = this;
  function step(n) {
    if (typeof(n) == "undefined") n = 1;
    i += n;
    me.col += n;
  }
  var result;
  while (i < s.length) {
    if (s[i] == ' ' || s[i] == "\t") {
      step();
    }
    else if (s[i] == '}') {
      this.state = STATE_ECHO;
      step();
      break;
    }
    else if (s[i] == "\n") {
      this.col = 1;
      this.row++;
      i++;
    }
    else if (s[i] == '(') {
      result = this._makeToken('(');
      step();
      break;
    }
    else if (s[i] == ')') {
      result = this._makeToken(')');
      step();
      break;
    }
    else if (s[i] == '.') {
      result = this._makeToken('.');
      step();
      break;
    }
    else if (keyword("if", s, i)) {
      result = this._makeToken(tokens.IF);
      step(2);
      break;
    }
    else if (keyword("elif", s, i)) {
      result = this._makeToken(tokens.ELIF);
      step(4);
      break;
    }
    else if (keyword("else", s, i)) {
      result = this._makeToken(tokens.ELSE);
      step(4);
      break;
    }
    //  later.
    /*
    else if (keyword("and", s, i)) {
      result = this._makeToken(tokens.AND);
      step(3);
      break;
    }
    else if (keyword("or", s, i)) {
      result = this._makeToken(tokens.OR);
      step(2);
      break;
    }
    else if (keyword("not", s, i)) {
      result = this._makeToken(tokens.NOT);
      step(3);
      break;
    }
    */
    else if (keyword("foreach", s, i)) {
      result = this._makeToken(tokens.FOREACH);
      step(7);
      break;
    }
    else if (keyword("in", s, i)) {
      result = this._makeToken(tokens.IN);
      step(2);
      break;
    }
    else if (keyword("end", s, i)) {
      result = this._makeToken(tokens.END);
      step(3);
      break;
    }
    else if ((s[i] >= 'a' && s[i] <= 'z') || (s[i] >= 'A' && s[i] <= 'Z') || s[i] == '_') {
      var value = ident(s, i);
      result = this._makeToken(tokens.IDENT, value);
      step(value.length);
      break;
    }
    else {
      this._unexpectedToken(s[i]);
    }
  }
  this.pos = i;

  if (result) {
    return result;
  }
  else if (this.pos >= s.length) {
    return this._makeToken(tokens.EOF);
  }
  else {
    //
    // start looking for tokens again
    //
    return this.next();
  }
}

exports.createScanner = function(source, filename) {
  return new Scanner(source, filename);
}

exports.SyntaxError = SyntaxError;
