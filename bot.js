var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');

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


bot.on('message', function(user, userID, channelID, message, evt) {
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        args = args.splice(1);
        switch (cmd) {
            // !ping
            case 'poll':
                var poll = new Poll("This is a test poll", 5, function() {
					bot.sendMessage({
						to: channelID,
						message: "The poll has ended!"
					});
				});
                var timer = setInterval(function() {
						poll.incrementTime(-1);
				}, 1000);
				poll.setTimer(timer);
                bot.sendMessage({
                    to: channelID,
                    message: "Permament poll system implemented. Hello from the Pi! Oh yeah the poll\n" + poll.poll + "\n" + poll.getTime()
                });
                
                
                break;
        }
    }
});

function Poll(poll, timer, callback) {
    this.poll = poll;
    this.timer = timer;
    this.callback = callback;
    
    this.timerObj = null;
    
    this.incrementTime = function(timerAmt) {
		this.timer += timerAmt;
		if (this.timer <= 0) {
			this.callback();
			clearInterval(this.timerObj);
		}
	};
	
	this.setTimer = function(timerObj) {
		this.timerObj = timerObj;
	};
    
    this.getTime = function() {
        return "Time left is " + this.timer + " seconds";
    };
}
