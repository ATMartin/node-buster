#!/usr/bin/env node
var shell = require('shelljs'),
    util = require('util'),
    path = require('path'),
    fs = require('fs');

Array.prototype.includes = function(v) { return this.indexOf(v) !== -1; } 

var myprompt = {
  defaultInput: function() {
    var input = "ERROR";
    process.stdin.resume();
    process.stdin.on('data', function(txt) { process.stdin.pause(); return txt; });
  },

  readline: function(msg) {
    console.log(msg);
    this.defaultInput();
  }
}

var name = myprompt.readline("What's your name?");
/*  ^-- This is non-blocking - it accepts input, but only after running
 *  the directives that come after, resulting in "undefined" calls.
 *  Gotta work on making it block. Maybe use callbacks / "promises"?
 *  I don't want to rely on those but they might work, especiall in a 
 *  loop scenario. 
 */

console.log("Thanks, " + name + "!");

