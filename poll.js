class Poll {

	constructor(channelID, pollText, time, options, sendMessage) {
		this.pollText = pollText;
		this.time = time;
		this.options = options;
		this.sendMessage = sendMessage;
		this.timerObj = null;
		this.isDone = false;
		this.channelID = channelID;
		// make random color
		this.color = parseInt("0x" + (Math.random().toString(16) + "000000").slice(2, 8));
		this.reminderTimes = [60, 60 * 5, 60 * 30, 60 * 60, 60 * 60 *6, 60 * 60 * 12, 60 * 60 * 24];	
		
	}	
	
	incrementTime(timerAmt) {
		this.time += timerAmt;
		
		if (this.reminderTimes.includes(this.time)) {
			this.sendMessage("Poll is ending soon, get your votes in fast!");
		}
		
		if (this.time <= 0) {
			this.isDone = true;
			this.sendMessage("The poll has finished!");
			clearInterval(this.timerObj);
		}
	}
	
	setTimer(timerObj) {
		this.timerObj = timerObj;
	}
	
	broadcast(message) {
		// make procedural options array
		var footerObj = {}
		var fields = [];
		var letters = ["A", "B", "C", "D", "E", "F"];
		for (i = 0; i < this.options.length; i++) {
			fields.push({"name": letters[i] + ") " + this.options[i], "value": "20% (4 users)", "inline": true });
		}
		if (!this.isDone) {
			// Code for adjust to poll being active
			fields.push({
				"name": "\n*How do you vote?* ",
				"value": "Use votepoll{poll:" + this.pollText.split(" ").slice(0, 2).join(" ") + " option: " + 
						letters.slice(0, this.options.length).join("/") + "} to vote!"			
			});
			// rework footer text for time left to show 1 minute, 2 hours, etc
			// first fine biggest time measurement that fits (seconds, minutes, hours, days)
			if (this.time >= (60 * 60 * 24)) {
				var daycount = this.time / (60 * 60 * 24);
				footerObj.text = "Time left: " + daycount + " day" + (daycount > 1 ? "s" : "");
			} else if (this.time >= (60 * 60)) {
				var hours = this.time / (60 * 60);
				footerObj.text = "Time left: " + hours + " hour" + (hours > 1 ? "s" : "");
			} else if (this.time >= 60) {
				var minutes = this.time / 60;
				footerObj.text = "Time left: " + minutes + " minute" + (minutes > 1 ? "s" : "");
			} else {
				footerObj.text = "Time left: " + this.time + " second" + (this.time > 1 ? "s" : "");
			}
			footerObj.icon_url = "https://upload.wikimedia.org/wikipedia/commons/3/37/Clock.gif"
		} else {
			// Code to adjust for the poll being done
			footerObj.text = "Poll finished";
		}
		
		return {
			"to": this.channelID,
			"embed": {
				"color": this.color,
				"author": {
					"name": this.pollText,
					"icon_url": "http://www.stickpng.com/assets/thumbs/5a4613ddd099a2ad03f9c994.png"
				},
				"timestamp": new Date(),
				"title": message,
				"footer": footerObj,
				"fields": fields
			}
		}
	}
}

module.exports = Poll;
