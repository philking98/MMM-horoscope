/* MMM-horoscope
 * Node Helper
 *
 * By morozgrafix https://github.com/morozgrafix/MMM-horoscope
 *
 * License: MIT
 *
 * Based on https://github.com/fewieden/MMM-soccer/blob/master/node_helper.js
 *
 */

const request = require("request");
const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
	// subclass start method
	start: function(){
		this.getting_horoscope_data = false;
	},

	// subclass socketNotificationReceived method
	socketNotificationReceived: function(notification, payload) {

		if (notification === "GET_HOROSCOPE_DATA") {
			if (!this.getting_horoscope_data) {
				this.getting_horoscope_data = true;

				var options = {
					url: 'https://www.astrology.com/horoscope/daily/' + payload.sign +'.html',
					method: 'GET'
				};
				this.getData(options);
			}
			else {
				console.log("HOROSCOPE_DATA: alreading getting horoscope data");
		} }
	},

	// get data from URL and broadcast it to MagicMirror module if everyting is OK
	getData: function(options) {
		request(options, (error, response, body) => {
			if ((typeof response.statusCode !== 'undefined') &&
					(response.statusCode === 200)) {

				let startPattern = "<div id=\"content\">";
				let start = body.search(startPattern);
				let stop = (body.slice(start)).search("</div>");
				let horoscopeText = body.slice(start + startPattern.length, start + stop);

				startPattern = "<span id=\"content-date\">";
				start = body.search(startPattern);
				stop = (body.slice(start)).search("</span>");
				let horoscopeDate = body.slice(start + startPattern.length, start + stop);

				this.sendSocketNotification("HOROSCOPE_DATA", {
						text: horoscopeText,
						date: horoscopeDate });
			} else {
				this.sendSocketNotification("HOROSCOPE_DATA");
				console.log("Error getting Horoscope data. Response:" + JSON.stringify(response));
			}
			this.getting_horoscope_data = false;
		});
	}
});
