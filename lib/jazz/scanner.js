/*
 *  jazz -- A simple template engine for nodejs
 *  Copyright (C) 2010 Shine Technologies
 */

var tokens = require("./tokens");
var error = require("./error");

var STATE_ECHO = 0;
var STATE_CODE = 1;

function Scanner(source, filename) {
  filename = filename || "<unknown>";
  this.source = source;
  this.pos = 0;
  this.filename = filename;
  this.row = 1;
  this.col = 1;
  this.braceLevel = 0;
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
  throw new error.SyntaxError(this.filename, this.row, this.col, message);
}

Scanner.prototype._unexpectedToken = function(token, didYouMean) {
  return this._syntaxError("unexpected token: '" + token + "'" + (didYouMean ? ", did you mean '" + didYouMean + "'" : ''));
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
  if (s[j-1] == '.') return false;
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

function num(s, i) {
  var hex = false;
  var seenDecimal = false;
  var j = i;
  if (s.length >= i + 2 && s[i] == '0' && s[i+1] == 'x') {
    hex = true;
    j += 2;
  }
  while (j < s.length) {
    if (s[j] >= '0' && s[j] <= '9') {
      j++;
    }
    else if (!hex && !seenDecimal && s[j] == '.') {
      seenDecimal = true;
      j++;
    }
    else if (hex) {
      if ((s[j] >= 'a' && s[j] <= 'f') || (s[j] >= 'A' && s[j] <= 'F')) {
        j++;
      }
      else break;
    }
    else break; // XXX what about e.g. 1050a123h ?? (invalid chars)
                // parentheses would still be valid at the end of a number!
  }
  return s.slice(i, j);
}

function str(s, i) {
  var r = "";
  var q = s[i++];
  var esc = false;
  while (i < s.length) {
    if (s[i] == q) {
      return r;
    }
    else if (!esc && s[i] == "\\") {
      esc = true;
      i++;
    }
    else if (esc) {
      switch (s[i]) {
        case "\\":
          r += "\\";
          break;
        case "n":
          r += "\n";
          break;
        case "r":
          r += "\r";
          break;
        case "t":
          r += "\t";
          break;
        // TODO more escape sequences
        default:
          r += "\\" + s[i];
      }
      i++;
      esc = false;
    }
    else
      r += s[i++];
  }
  // TODO syntax error if i >= s.length
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
    else if (s[i] == '{') {
      this.braceLevel++;
      result = this._makeToken('{');
      step();
      break;
    }
    else if (s[i] == '}' && this.braceLevel == 0) {
      this.state = STATE_ECHO;
      step();
      break;
    }
    else if (s[i] == '}') {
      this.braceLevel--;
      result = this._makeToken('}');
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
    else if (s[i] == '[') {
      result = this._makeToken('[');
      step();
      break;
    }
    else if (s[i] == ']') {
      result = this._makeToken(']');
      step();
      break;
    }
    else if (s[i] == ',') {
      result = this._makeToken(',');
      step();
      break;
    }
    else if (s[i] == '.') {
      result = this._makeToken('.');
      step();
      break;
    }
    else if (s[i] == ':') {
      result = this._makeToken(':');
      step();
      break;
    }
    else if (s[i] == '"' || s[i] == "'") {
      var value = str(s, i);
      result = this._makeToken(tokens.STR, value);
      step(value.length + 2); // + 2 for start/end quote
      break;
    }
    else if (s[i] >= '0' && s[i] <= '9') {
      var value = num(s, i);
      result = this._makeToken(tokens.NUM, value);
      step(value.length);
      break;
    }
    else if (s[i] == '@') {
      result = this._makeToken('@');
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
    else if (keyword("elsif", s, i)) {
        // TODO Hack to prevent urge to stab yourself in the eye when you use 'elsif' instead of 'elif'
        this._unexpectedToken("elsif", "elif");
    }
    else if (keyword("else", s, i)) {
      result = this._makeToken(tokens.ELSE);
      step(4);
      break;
    }
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
    else if (keyword("eq", s, i)) {
      result = this._makeToken(tokens.EQ);
      step(2);
      break;
    }
    else if (keyword("neq", s, i)) {
      result = this._makeToken(tokens.NEQ);
      step(3);
      break;
    }
    else if (keyword("gt", s, i)) {
      result = this._makeToken(tokens.GT);
      step(2);
      break;
    }
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
    else if (keyword("empty", s, i)) {
      result = this._makeToken(tokens.EMPTY);
      step(5);
      break;
    }
    else if (keyword("true", s, i)) {
      result = this._makeToken(tokens.BOOL, 'true');
      step(4);
      break;
    }
    else if (keyword("false", s, i)) {
      result = this._makeToken(tokens.BOOL, 'false');
      step(5);
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
