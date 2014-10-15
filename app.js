#!/usr/bin/env node
var shell = require('shelljs'),
    util = require('util'),
    path = require('path'),
    fs = require('fs'),
    inquirer = require('inquirer');

Array.prototype.includes = function(v) { return this.indexOf(v) !== -1; } 


console.log("Welcome to Node-Buster!");

var questionsInit = [
  {
    type: "list",
    name: "Command",
    message: "What would you like to do?",
    choices: ["1. Set up a local repo", "2. Configure an existing repo", "3. Generate static pages", "4. Push existing pages to my repo"],
    filter: function (choice) { return choice.charAt(0); }
    }
];

inquirer.prompt( questionsInit, function(answers) {
  console.log(JSON.stringify(answers, null, ' '));
});


