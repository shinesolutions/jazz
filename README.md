Jazz is a simple template engine built specifically for nodejs.

# Usage

    var jazz = require("jazz");

    var template = jazz.compile("my template source code {someVariable}");
    var output = template.eval({"someVariable", "lolmuffin"});
    sys.puts(output); // or write response to server, write to a file, ...

This example would output the following:

    my template source code lolmuffin

# Syntax

!!! SYNTAX IS VERY MUCH STILL SUBJECT TO CHANGE !!!

## Expressions

## Printing variables

    {someVariable}

## Filtering values prior to output

*NOT IMPLEMENTED YET*

    {someVariable|someFilter}

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

# Performance

Although it's not really fair to compare Jazz to other template engines out there since
it's still very early in development, we found the following totally contrived benchmark
to be promising:

## json-template

    $ cat benchmark-jt.js 
    var jt = require("./json-template");

    var template = jt.Template("Hello, World");

    for (var i = 0; i < 5000000; i++) {
      template.expand({});
    }

    $ time node benchmark-jt.js 

    real    0m4.903s
    user    0m4.896s
    sys     0m0.004s

## jazz

    $ cat benchmark-jazz.js 
    var jazz = require("./jazz");
    var template = jazz.compile("Hello, World");

    for (var i = 0; i < 5000000; i++) {
      template.eval({});
    }

    $ time node benchmark-jazz.js 

    real    0m0.683s
    user    0m0.672s
    sys     0m0.008s

