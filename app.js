#!/usr/bin/env node
var shell = require('shelljs'),
    util = require('util'),
    path = require('path'),
    fs = require('fs'),
    inquirer = require('inquirer');

Array.prototype.includes = function(v) { return this.indexOf(v) !== -1; } 

//---------------------QUESTIONS---------------------------
var questionsInit = [
  {
    type: "list",
    name: "startup",
    message: "What would you like to do?",
    choices: ["1. Set up a local repo", "2. Configure an existing repo", "3. Generate static pages", "4. Push existing pages to my repo"],
    filter: function (choice) { return choice.charAt(0); }
    }
];

var questionsSetup = [
  {
      type: "confirm",
      name: "confirmation",
      message: "This will delete any existing content. Is this okay?",
      default: false
  }
]

//------------------PROMPTS--------------------------------
var startup = function() { 
  inquirer.prompt( questionsInit, function(answers) {
    switch (answers.startup) {
      case "1":
        promptSetup();  
        break;
      case "2":
        promptConfigure();
        break;
      case "3":
        promptGenerate();
        break;
      case "4":
        promptPush();
        break;
      default:
        console.log("Sorry, I didn't understand that!");
    } 
  });
}

var promptSetup = function() {
  console.log("This will create a 'static' folder in the current directory and set up an empty git repo within it.");
  inquirer.prompt(questionsSetup, function(answers) {
    if (answers.confirmation) {
      console.log("Beginning git setup!");
    } else {
      console.log("Returning to index...");
      startup();
    }
  }); 
};
var promptConfigure = function() {};
var promptGenerate = function() {};
var promptPush = function() {};


//-----------------METHODS-------------------------------



//--------------PROGRAM FLOW---------------------------
console.log("Welcome to Node-Buster!");
startup();
