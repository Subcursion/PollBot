class Poll {

	constructor(channelID, pollText, time, options, callback) {
		this.pollText = pollText;
		this.time = time;
		this.options = options;
		this.callback = callback;
		this.timerObj = null;
		this.isDone = false;
		this.channelID = channelID;
		// make random color
		this.color = parseInt("0x" + (Math.random().toString(16) + "000000").slice(2, 8));
	}	
	
	incrementTime(timerAmt) {
		this.time += timerAmt;
		
		if (this.time <= 0) {
			this.isDone = true;
			this.callback();
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
		var letters = ["A", "B", "C", "D"];
		for (i = 0; i < this.options.length; i++) {
			fields.push({"name": letters[i] + ") " + this.options[i], "value": "20% (4 users)", "inline": true});
		}
		if (!this.isDone) {
			// Code for adjust to poll being active
			fields.push({
				"name": "\n*How do you vote?* ",
				"value": "Use votepoll{poll:" + this.pollText.split(" ").slice(0, 2).join(" ") + " option: " + 
						letters.slice(0, this.options.length).join("/") + "} to vote!"			
			});
			footerObj.text = "Time left: " + this.time + " seconds";
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
