Module.register("MMM-horoscope",{
	defaults: {
		sign: "aries",
		updateInterval: 1 * 60 * 60 * 1000, // updates every hour
		timeShift: 5 * 60 * 60 * 1000, // shift clock in milliseconds to start showing next day horoscope at 7pm (24 - 19 = 5)
		useTextIcon: true,
		initialLoadDelay: 0,
		animationSpeed: 2000,
		zodiacTable: {
			"aries": {
				"signId": "ari",
				"range": "3/21-4/19",
				"unicodeChar": "&#9800;"
			},
			"taurus": {
				"signId": "tau",
				"range": "4/20-5/20",
				"unicodeChar": "&#9801;"
			},
			"gemini": {
				"signId": "gem",
				"range": "5/21-6/21",
				"unicodeChar": "&#9802;"
			},
			"cancer": {
				"signId": "can",
				"range": "6/22-7/22",
				"unicodeChar": "&#9803;"
			},
			"leo": {
				"signId": "leo",
				"range": "7/23-8/22",
				"unicodeChar": "&#9804;"
			},
			"virgo": {
				"signId": "vir",
				"range": "8/23-9/22",
				"unicodeChar": "&#9805;"
			},
			"libra": {
				"signId": "lib",
				"range": "9/23-10/22",
				"unicodeChar": "&#9806;"
			},
			"scorpio": {
				"signId": "sco",
				"range": "10/23-11/21",
				"unicodeChar": "&#9807;"
			},
			"sagittarius": {
				"signId": "sag",
				"range": "11/22-12/21",
				"unicodeChar": "&#9808;"
			},
			"capricorn": {
				"signId": "cap",
				"range": "12/22-1/19",
				"unicodeChar": "&#9809;"
			},
			"aquarius": {
				"signId": "aqu",
				"range": "1/20-2/18",
				"unicodeChar": "&#9810;"
			},
			"pisces": {
				"signId": "pis",
				"range": "2/19-3/20",
				"unicodeChar": "&#9811;"
			}
		},
		debug: false
	},

	getStyles: function() {
		return ["MMM-horoscope.css"];
	},

	start: function() {
		Log.info("Starting module: " + this.name);

		// just in case someone puts mixed case in their config files
		this.config.sign = this.config.sign.toLowerCase();
		this.sign = this.config.zodiacTable[this.config.sign]["unicodeChar"];
		this.signText = this.config.sign;

		this.horoscopeText = null;
		this.horoscopeDate = null;

		this.updateHoroscope();
	},

	updateHoroscope: function() {
		this.date = new Date();
		this.sendSocketNotification("GET_HOROSCOPE_DATA", {
				sign: this.config.sign });
	},

	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		if (this.config.debug) {
			nextLoad = 5 * 60 * 1000; // update very 5 minute for debug
		}

		Log.info("MMM-horoscope: nextLoad: ", nextLoad);
		var self = this;
/*		setTimeout(function() {
			self.updateHoroscope();
		}, nextLoad);

		*/
	},

	// Subclass socketNotificationReceived method.
	socketNotificationReceived: function(notification, payload){
		if (notification === "HOROSCOPE_DATA") {
			this.loaded = true;
			if (payload != null) {
				this.error = false;

				this.horoscopeText = payload.text;
				this.horoscopeDate = payload.date;
			} else {
				this.error = true;
				Log.error("MMM-horoscope: Unable to get horoscope from API.");
			}
			this.updateDom(this.config.animationSpeed);
			this.scheduleUpdate();
		}
	},

	getDom: function() {
		let wrapper = document.createElement("div");
		wrapper.className = "horoscope-wrapper"

		if (this.config.sign === "") {
			wrapper.innerHTML = "Please set the correct Zodiac <i>sign</i> in the config for module: " + this.name + ".";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (!this.loaded) {
			wrapper.innerHTML = "Aligning Stars...";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (this.error) {
			wrapper.innerHTML = "Something went wrong. Please check logs.";
			wrapper.className = "bright light small";
			return wrapper;
		}

		let horoscopeTop = document.createElement("div");
		horoscopeTop.className = "horoscope-top";

		let zodiacIcon = document.createElement("div");
		if (this.config.useTextIcon) {
			zodiacIcon.className = "zodiac-text-icon";
			zodiacIcon.innerHTML = this.sign;
		} else {
			zodiacIcon.className = "zodiac-icon " + this.config.sign;
		}

		let horoscopeTitle = document.createElement("div");
		horoscopeTitle.className = "horoscope-title";

		let zodiacSignText = document.createElement("div");
		zodiacSignText.className = "zodiac-sign-text";
		zodiacSignText.innerHTML = this.signText;

		let horoscopeDate = document.createElement("div");
		horoscopeDate.className = "horoscope-date";
		horoscopeDate.innerHTML = "Horoscope for " + this.horoscopeDate;

		horoscopeTitle.appendChild(zodiacSignText);
		horoscopeTitle.appendChild(horoscopeDate);

		horoscopeTop.appendChild(zodiacIcon);
		horoscopeTop.appendChild(horoscopeTitle);

		let horoscopeText = document.createElement("div");
		horoscopeText.className = "horoscope-text";
		horoscopeText.innerHTML = this.horoscopeText;

		wrapper.appendChild(horoscopeTop);
		wrapper.appendChild(horoscopeText);

		return wrapper;
	}
});
