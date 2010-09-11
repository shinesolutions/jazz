/*
 *  jazz -- A simple template engine for nodejs
 *  Copyright (C) 2010 Shine Technologies
 */

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

exports.SyntaxError = SyntaxError;

