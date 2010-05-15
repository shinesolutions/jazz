Jazz is a simple template engine built specifically for nodejs.

# Usage

    var jazz = require("jazz");

    var template = jazz.compile("my template source code {someVariable}");
    var output = template.eval({"someVariable": "lolmuffin"});
    sys.puts(output); // or write response to server, write to a file, ...

This example would output the following:

    my template source code lolmuffin

# Syntax

!!! SYNTAX IS VERY MUCH STILL SUBJECT TO CHANGE !!!

## Expressions

## Printing variables

    {someVariable}

## Filter functions

You can call filter functions like so:

    {someFilter(someVariable)}

!!! It is currently not possible to chain filter functions, but support is planned!

## Conditional Statements

You can check if a variable evaluates to a true value like so:

    {if name}
        Hello, {name}
    {end}

Else clauses are also supported:

    {if name}
        Hello, {name}
    {else}
        Hello, Captain Anonymous
    {end}

As are else..if clauses:

    {if firstName}
        Hello, {firstName}
    {elif lastName}
        Hello, Mr. {lastName}
    {else}
        Hello, Captain Anonymous
    {end}

## Looping over an array

    {foreach item in someArray}
        <p>{item}</p>
    {end}


