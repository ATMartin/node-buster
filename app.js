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
    choices: ["1. Set up a local repo", "2. Configure an existing repo", "3. Generate static pages", "4. Push existing pages to my repo", "5. Quit this utility."],
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
];

var questionsGenerate = [
  {
    type: "input",
    name: "sourceUrl",
    message: "Where is your blog currently located?"
  }
];

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
      case "5":
        promptExit();
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
      shell.rm("-rf", "./static");
      shell.mkdir("static");
      shell.cd("static");
      shell.exec("git init");
      shell.exec("git checkout -b 'gh-pages'");
      shell.cd("..");
      console.log("Git setup complete!");
    } else {
      console.log("Returning to index...");
    }
    startup();
  }); 
};
var promptConfigure = function() {};
var promptGenerate = function() {
  inquirer.prompt(questionsGenerate, function(answers) {
    var commandText = "wget --recursive" +
                      " --convert-links" +
                      " --page-requisites" +
                      " --no-parent" +
                      " --directory-prefix ./static" +
                      " --no-host-directories" +
                      " " + answers.sourceUrl;
    console.log("Retreiving your blog from " + answers.sourceUrl + " now!");
    shell.exec(commandText, function(err, stdout, stderr) {
      if (err === null || err === "0") { 
        console.log("Static generation complete!"); 
      } else { 
        console.log("Uh-oh, something broke: " + err);   
      }
      startup();
    });
  });
};
var promptPush = function() {
  shell.cd("static");
  shell.exec("git push origin gh-pages");
  shell.cd("..");
  startup();
};
var promptExit = function() {
  console.log("Thanks for using Node-Buster! See you soon!");
  process.exit(0);
};


//--------------PROGRAM FLOW---------------------------
console.log("Welcome to Node-Buster!");
startup();
