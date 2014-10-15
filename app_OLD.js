#!/usr/bin/env node
//Includes
var exec = require('child_process').exec,
		util = require('util'),
		path = require('path');

//Prototypes for making things a littler DRYer
Array.prototype.includes = function(obj) { return (this.indexOf(obj) !== -1); }

var Prompt = function(prompttext, callfunc) {
	var usrinput = "ERROR";
	console.log(prompttext);
	process.stdin.resume();
	process.stdin.setEncoding('utf-8');
	process.stdin.on('data', function(input) {
		process.stdin.pause();
		callfunc(input);
	});
}

// Main App Logic 
console.log(process.argv);
var args = process.argv.slice(2);

if 			(args.includes("--print")) { console.log(args[args.indexOf("-p")+1]); }
else if	(args.includes("--generate")) { 
		var myGen = Prompt("URL for your blog?", function(i) { generateStatic(i); });
}
else if (args.includes("--setup")) {
	var go = Prompt("Press any key to make your repo!", function(i) {generateRepo();});
}
else if (args.includes("--add-remote")) {
	var remoteAddress = args[args.indexOf("--add-remote")+1];
	var go = Prompt("Press any key to add your remote!", function(i) { addRemote(remoteAddress); });
}
else if (args.includes("--deploy")) {
	console.log("Pushing your static files up!");
	var deployFiles = Prompt("Directory of your static files?", function(i) { deployFiles(i) });
}
else if (args.includes("--path")) {
	// console.log(require('path').dirname(require.main.filename));
	exec("cd mydir && git init", execGeneric);
}

// Callback functions for various routes
var generateStatic = function(sourceUrl) {
	var commandText =	"wget --recursive" +
										" --convert-links" +
										" --page-requisites" +
										" --no-parent" +
										" --directory-prefix ./static" +
										" --no-host-directories" +
										" " + sourceUrl;
	exec(commandText, execGeneric);
}

var generateRepo = function() {
	exec("git init",  execGeneric);
	setTimeout( function() { exec("git checkout -b gh-pages", execGeneric) },  500); //Wait for git init to make our directory.
	// console.log("All set! Use './app.js --add-remote' to add your remote repo!");
	console.log("All done!");
}

var addRemote = function(remoteAddress) {
	exec("git remote add origin " + remoteAddress, execGeneric);
	console.log("Remote added as Origin! Use './app --deploy' to push it all up!");
}

var deployFiles = function(dirName) {
	currentPath = path.dirname(require.main.filename);
	exec("mv .git ./static/.git", execGeneric);
	setTimeout( function() { exec("git add .", {cwd: currentPath + "/static"}, execGeneric); }, 500);
	setTimeout( function() { exec("git commit -m 'Added automagically!'", {cwd: currentPath + "/static"}, execGeneric); }, 1500);
	setTimeout( function() { exec("git push origin gh-pages", {cwd: currentPath + "/static"}, execGeneric); }, 3000);
	console.log("It's up! Check it out!");
}

var execGeneric = function(err, stdout, stderr) {
	console.log('stdout: ' + stdout);
	console.log('stderr: ' + stderr);
	if (err !== null) {
		console.log('ERROR: ' + err);
	}
	
}

