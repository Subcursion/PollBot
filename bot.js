var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var Poll = require("./poll.js");

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
    token: auth.token,
    autorun: true
});

var PollList = [];

bot.on('ready', function(evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

setInterval(function() {
	// Clean up PollList for expired timers
	if (PollList.length == 0)
		return;
	
	logger.info("Cleaning up PollList (" + PollList.length + ")...");
	for (i = 0; i < PollList.length; i++) {
		if (PollList[i].isDone) {
			PollList.splice(i, 1);
			i--;
		}
	}
	logger.info("All done. PollList (" + PollList.length + ")");
}, 30000);

var showNewPollUsage = function(channelID) {
	bot.sendMessage({ to: channelID, message: "You seem confused. Here's how to do it: newpoll{poll: <poll text> time: #(s/m/h) option: <option text> option: <option text>} (Order doesn't matter, min 2 options needed, max of 6)"});
}

bot.on('message', function(user, userID, channelID, message, evt) {
	if (userID == bot.id)
		return;
		
	if (message.includes("newpoll{")) {
		// NEW POLL MODE
		// seperate poll section out
		var newpollLoc = message.indexOf("newpoll{");
		// find closing brack '}'
		var lastBrackLoc = message.indexOf("}", newpollLoc + 8);
		if (lastBrackLoc == -1) {
			bot.sendMessage({
					to: channelID,
					message: "Can't creat a new poll. Reason: Missing a closing bracket.. I know it's silly."
			});
			return;
		}
		// extract the string
		var request = message.substring(newpollLoc + 8, lastBrackLoc);
		var specialLocations = []
		// check if everything we need is found
		// find poll: location
		var pollLoc = request.indexOf("poll:");
		if (pollLoc == -1) {
			showNewPollUsage(channelID);
			return;
		}
		specialLocations.push(pollLoc);
		// find time: location
		var timeLoc = request.indexOf("time:");
		if (timeLoc == -1) {
			showNewPollUsage(channelID);
			return;
		}
		specialLocations.push(timeLoc);
		// then find the options
		var optionLoc = request.indexOf("option:");
		// check if none were even found
		if (optionLoc == -1) {
			showNewPollUsage(channelID);
			return;
		}
		// otherwise load their locations in
		var optionLocs = [];
		while (optionLoc != -1) {
			specialLocations.push(optionLoc);
			optionLocs.push(optionLoc);
			optionLoc = request.indexOf("option:", optionLoc + 1);
		}
		if (optionLocs.length < 2) {
			showNewPollUsage(channelID);
			return;
		} else if (optionLocs.length > 6) {
			showNewPollUsage(channelID);
			return;
		}
		
		// for each extraction, go until another special index is found, substring to there, there ya go!
		// extract poll: string
		var index = pollLoc + 5;
		while (index < request.length && !(specialLocations.includes(index))) {
			index++;
		}
		var pollText = request.substring(pollLoc + 5, index).trim();
		if (pollText.length == 0) {
			bot.sendMessage({ to: channelID, message: "Your poll was empty!" });
			return;
		}
		
		// extract time: string
		index = timeLoc + 5;
		while (index < request.length && !(specialLocations.includes(index))) {
			index++;
		}
		var timeText = request.substring(timeLoc + 5, index).trim();
		if (timeText.length == 0) {
			bot.sendMessage({ to: channelID, message: "Your time was empty!" });
			return;
		}
		
		// extract all option: strings
		var optionStrings = []
		for (i = 0; i < optionLocs.length; i++) {
			index = optionLocs[i] + 7;
			while (index < request.length && !(specialLocations.includes(index))) {
				index++;
			}
			var optionText = request.substring(optionLocs[i] + 7, index).trim();
			if (optionText.length == 0) {
				bot.sendMessage({ to: channelID, message: "One of your options was empty!" });
				return;
			}
			optionStrings.push(optionText);
		}
		
		// convert timeText to seconds
		// check for s/m/h at end
		var unit = timeText.substring(timeText.length - 1, timeText.length);
		if (unit != "s" && unit != "m" && unit != "h" && unit != "d") {
			bot.sendMessage({ to: channelID, message: "Unrecognized time unit used. Please use s (seconds), m (minutes), h (hours), or d (days) like so time: 60s" });
			return;
		}
		// strip the unit out
		var time = parseInt(timeText);
		if (isNaN(time)) {
			bot.sendMessage({ to: channelID, message: "I couldn't read your time. Please enter it as #s/m/h/d like so time: 60s" });
			return;
		}
		if (time <= 0) {
			bot.sendMessage({ to: channelID, message: "Kind of pointless to have a 0 or negative time isn't it?" });
			return;
		}
		// convert to seconds
		if (unit == "m")
			time *= 60;
		if (unit == "h")
			time *= 60 * 60;
		if (unit == "d")
			time *= 60 * 60 * 24;
		
		// by this point, we should be ready to actually create the new poll!
		var poll = new Poll(channelID, pollText, time, optionStrings, function(message) {
			bot.sendMessage(poll.broadcast(message));
		});
		
		var timer = setInterval(function() {poll.incrementTime(-1);}, 1000);
		poll.setTimer(timer);
		PollList.push(poll);
		
		bot.sendMessage(poll.broadcast("The poll has started! Get your votes in!"));
		
	} else if (message.includes("viewpoll{")) {
		
	} else if (message.includes("votepoll{")) {
		
	}
});

