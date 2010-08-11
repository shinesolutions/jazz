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
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *  
 *  You should have received a copy of the GNU General Public License along
 *  with this program; if not, write to the Free Software Foundation, Inc.,
 *  51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

var TOKEN_PREFIX = "jazz.tokens.";

exports.ECHO = TOKEN_PREFIX + "ECHO";
exports.IF = TOKEN_PREFIX + "IF";
exports.ELIF = TOKEN_PREFIX + "ELIF";
exports.ELSE = TOKEN_PREFIX + "ELSE";
exports.EACH = TOKEN_PREFIX + "FOREACH";
exports.IN = TOKEN_PREFIX + "IN";
exports.AND = TOKEN_PREFIX + "AND";
exports.OR = TOKEN_PREFIX + "OR";
exports.NOT = TOKEN_PREFIX + "NOT";
exports.IDENT = TOKEN_PREFIX + "IDENT";
exports.END = TOKEN_PREFIX + "END";
exports.STR = TOKEN_PREFIX + "STR";
exports.NUM = TOKEN_PREFIX + "NUM";
exports.EQ = TOKEN_PREFIX + "EQ";
exports.NEQ = TOKEN_PREFIX + "NEQ";
exports.GT = TOKEN_PREFIX + "GT";
exports.EOF = "<eof>";
