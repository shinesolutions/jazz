/*
 *  jazz -- A simple template engine for nodejs
 *  Copyright (C) 2010 Shine Technologies
 */

var TOKEN_PREFIX = "jazz.tokens.";

exports.ECHO = TOKEN_PREFIX + "ECHO";
exports.IF = TOKEN_PREFIX + "IF";
exports.ELIF = TOKEN_PREFIX + "ELIF";
exports.ELSE = TOKEN_PREFIX + "ELSE";
exports.FOREACH = TOKEN_PREFIX + "FOREACH";
exports.IN = TOKEN_PREFIX + "IN";
exports.AND = TOKEN_PREFIX + "AND";
exports.OR = TOKEN_PREFIX + "OR";
exports.NOT = TOKEN_PREFIX + "NOT";
exports.IDENT = TOKEN_PREFIX + "IDENT";
exports.END = TOKEN_PREFIX + "END";
exports.STR = TOKEN_PREFIX + "STR";
exports.NUM = TOKEN_PREFIX + "NUM";
exports.BOOL = TOKEN_PREFIX + "BOOL";
exports.EQ = TOKEN_PREFIX + "EQ";
exports.NEQ = TOKEN_PREFIX + "NEQ";
exports.GT = TOKEN_PREFIX + "GT";
exports.EMPTY = TOKEN_PREFIX + "EMPTY";
exports.EOF = "<eof>";
