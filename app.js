#!/usr/bin/env node
var shell = require('shelljs'),
    util = require('util'),
    path = require('path'),
    fs = require('fs'),
    inquirer = require('inquirer');

Array.prototype.includes = function(v) { return this.indexOf(v) !== -1; } 

function repo(url, branch, remoteName) {
  this.url = url;
  this.branch = branch;
  this.remoteName = remoteName;
}

var repoStore = [],
    repoChoices = [];

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
  },
  {
    type: "confirm",
    name: "confirmRepo",
    message: "Would you like to add a remote to this repo?",
    default: false,
    when: function(answers) { return answers.confirmation; }
    
  },
  {
    type: "input",
    name: "url",
    message: "What is the URL for your repository?: ",
    when: function(answers) { return answers.confirmRepo; }
  },
  {
    type: "input",
    name: "branch",
    message: "Which branch would you like to push to? (default: 'gh-pages'): ",
    default: "gh-pages",
    when: function(answers) { return answers.confirmRepo; }
  },
  {
    type: "input",
    name: "remoteName",
    message: "What would you like to call this remote? (default: 'origin'): ",
    default: "origin",
    when: function(answers) { return answers.confirmRepo; }
  }
];

var questionsConfigure = [
  {
    type: "list",
    name: "repoList",
    message: "Which repo would you like to configure?",
    choices: repoChoices,
    filter: function(choice) { return repoStore.filter(function(e) { e.remoteName === choice.substr(3); }); }
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
  if (fs.existsSync("repoStore.json")) { 
    try { 
      repoStore = JSON.parse(fs.readFileSync("repoStore.json"));
      var i = 1;
      repoStore.forEach( function(obj) { repoChoices.push( i + ". " + obj.remoteName); i++; });
    } catch (e) {
      //Probably a syntax error - no worries. Just move on.
    }
  }
  //console.log(repoStore);
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
      if (answers.confirmRepo) {
        var newRepo = new repo(answers.url, answers.branch, answers.remoteName);
        shell.exec("git remote add " + newRepo.remoteName + " " + newRepo.url);
        repoStore.push(newRepo);
      }
     shell.cd("..");
     console.log("Git setup complete!");
     startup();
    } else {
      console.log("Returning to index...");
      startup();
    }
  }); 
};
var promptConfigure = function() {
  if (repoStore.length == 0) {
    console.log("You have no repos currently set up!");
    startup();
  }
  inquirer.prompt( questionsConfigure, function(answers) {
    console.log(answers);
    startup();
  });
};
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
  fs.writeFileSync("repoStore.json", JSON.stringify(repoStore));
  console.log("Thanks for using Node-Buster! See you soon!");
  process.exit(0);
};


//--------------PROGRAM FLOW---------------------------
console.log("Welcome to Node-Buster!");
startup();
