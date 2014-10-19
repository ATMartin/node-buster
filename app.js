#!/usr/bin/env node
var shell = require('shelljs'),
    util = require('util'),
    path = require('path'),
    fs = require('fs'),
    inquirer = require('inquirer');

Array.prototype.includes = function(v) { return this.indexOf(v) !== -1; } 

function site(name, siteUrl, repoUrl, branch, remoteName) {
  this.name = name;
  this.siteUrl = siteUrl;
  this.repoUrl = repoUrl;
  this.branch = branch;
  this.remoteName = remoteName;
}

var activeSite = {};

//---------------------QUESTIONS---------------------------
var questionsInit = [
  {
    type: "list",
    name: "startup",
    message: "What would you like to do?",
    choices: ["1. Set up a new site", "2. Configure my existing site", "3. Generate static pages", "4. Push existing pages to my repo", "5. Quit this utility."],
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

var questionsSiteSetup = [
  {
    type: "confirm",
    name: "siteSetupConfirm",
    message: "This will erase your current site? Is this okay?",
    default: false
  }
]

var questionsSiteConfigure = [
  {
    type: "input",
    name: "name",
    message: "What would you like to call this site?",
  },
  {
    type: "input",
    name: "siteUrl",
    message: "Where is the active site located?",
  },
  {
  	type: "input",
  	name: "repoUrl",
  	message: "What's the address for your static repo?",
  },
  {
  	type: "input",
  	name: "branch",
  	message: "Which branch would you like to push to?",
  },
  {
  	type: "input",
  	name: "remoteName",
  	message: "What would like your remote name to be?",
  }
];

var questionsSiteOk = [
  {
    type: "confirm",
    name: "siteOkConfirm",
    message: "Would you like to update/change these settings?",
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
  if (fs.existsSync("siteStore.json")) { 
    try { 
      activeSite = JSON.parse(fs.readFileSync("siteStore.json"));
    } catch (e) {
      //Probably a syntax error - no worries. Just move on.
    }
  }
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
  if (!fs.existsSync("siteStore.json")) {
    console.log("You have no sites currently set up!");
    inquirer.prompt ( questionsSiteSetup, function(answers) {
      if (answers.siteSetupConfirm) {
        inquirer.prompt ( questionsSiteConfigure, function(answers) {
    	    activeSite = new site(answers.name, answers.siteUrl, answers.repoUrl, answers.branch, answers.remoteName);
    	    fs.writeFileSync("siteStore.json", JSON.stringify(activeSite));
    	    startup();
        });
      } else {
        console.log("Please set up a site to continue.");
        startup();
      }
    });
  } else {
    console.log("Your current site settings are:");
    console.log("**************************************");
    console.log("NAME: " + activeSite.name);
    console.log("URL: " + activeSite.siteUrl);
    console.log("REPO: " + activeSite.repoUrl);
    console.log("BRANCH: " + activeSite.branch);
    console.log("REMOTE: " + activeSite.remoteName);
    console.log("**************************************");
    inquirer.prompt ( questionsSiteOk, function(answers) {
      if (answers.siteOkConfirm) {
        inquirer.prompt ( questionsSiteConfigure, function(answers) {
          activeSite.name = answers.name;
          activeSite.siteUrl = answers.siteUrl;
          activeSite.repoUrl = answers.repoUrl;
          activeSite.branch = answers.branch;
          activeSite.remoteName = answers.remoteName;
          fs.writeFileSync("siteStore.json", JSON.stringify(activeSite));
          console.log("Your active site has been updated!");
          startup();
        });
      } else {
        console.log("Thanks for checking!");
        startup();
      }
    });
  }
};

var promptGenerate = function() {
   if (activeSite === {}) { console.log("No active site set!"); startup(); }
   var commandText = "wget --recursive" +
                     " --convert-links" +
                     " --page-requisites" +
                     " --no-parent" +
                     " --directory-prefix ./static" +
                     " --no-host-directories" +
                     " " + activeSite.siteUrl;
    console.log("Checking for existing site now.");
    if (fs.existsSync("./static/.git")) {
      shell.cd("static");
      shell.exec("git pull");
      shell.cd("..");
    } else {
      shell.mkdir("static");
      shell.exec("git clone " + activeSite.repoUrl + " static");
    }
    console.log("Retreiving your blog from " + activeSite.siteUrl + " now!");
    shell.exec(commandText, function(err, stdout, stderr) {
      if (err === null || err === 0) { 
        console.log("Static generation complete!"); 
      } else { 
        console.log("Uh-oh, something broke: " + err);   
      }
      startup();
    });
};
var promptPush = function() {
  if (activeSite === {}) { console.log("You don't have an active site set up for this!"); startup(); }
  shell.cd("static");
  shell.exec("git add .");
  shell.exec("git commit -m 'Auto-update by Node-Buster!'");
  shell.exec("git push " + activeSite.remoteName + " " + activeSite.branch);
  shell.cd("..");
  console.log("Your site has been updated!");
  startup();
};
var promptExit = function() {
  fs.writeFileSync("siteStore.json", JSON.stringify(activeSite));
  console.log("Thanks for using Node-Buster! See you soon!");
  process.exit(0);
};


//--------------PROGRAM FLOW---------------------------
console.log("Welcome to Node-Buster!");
startup();
