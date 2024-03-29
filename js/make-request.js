"use strict";

// Make requests to retrive information from Open Weather Map

const requestMaker = new (function () {
	
	const searchBox = document.getElementById("js-search-box");
	const sumbitButton = document.getElementById("js-submit");
	
	// API key format: https://api.openweathermap.org/data/2.5/forecast/hourly?q=Davis,US&appid=27a7b6edb55dd1f09b742757826b9053&units=imperial
	const APIFirstPart = "https://api.openweathermap.org/data/2.5/forecast/hourly?q=";
	const APISecondPart = "&appid=27a7b6edb55dd1f09b742757826b9053&units=imperial"
	sumbitButton.addEventListener("click", function () {
		const city = searchBox.value;
		requestMaker.search(city);
	});
	
	function getRequestPromise(url) {
		// Source consulted: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise 
		
		return new Promise(function (resolve) {
			let xhr = new XMLHttpRequest();
			
			// We want to read JSON format for this assignment
			const mimeType = "application/json";
			xhr.overrideMimeType(mimeType);
			
			// Define the functions to be executed upon success/failure
			xhr.onload = function () { // if succeeded
				resolve(xhr.responseText);
			};
			xhr.onerror = function () { // if failed
				console.log(xhr.status);
			};
			
			// Request method: GET (retrieve data only)
			xhr.open("GET", url); 
			xhr.send();
		});
	}
	
	async function getResponseText(url) {
		// Source consulted: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await
		// requestPromise waits for the promise returned by getRequestPromise(), and then return the response text that is resolved
		let requestPromise = await getRequestPromise(url);
		let responseText = Promise.resolve(requestPromise);
		return responseText;
	}
	
	Object.defineProperty(this, "search", {
		value: async function (city) {
			const url = APIFirstPart + city + APISecondPart;
			
			let responseText = await getResponseText(url);
			const weatherJSON = JSON.parse(responseText);
			
			console.log(weatherJSON);
			
			updateDOM(weatherJSON);
		}
	});
	
	function updateDOM(JSONobj) {
		const coord = JSONobj.city.coord;
		
		if (JSONobj.cod % 100 >= 4) {
			window.alert("An error encountered when getting data.");
			return;
		}
		
		// Current weather
		const currentTime = document.getElementById("js-current-time");
		const currentWeatherIcon = document.getElementById("js-current-weather-icon");
		const currentTemp = document.getElementById("js-current-temp");
		
		// Future weather
		const futureTimes = document.getElementsByClassName("js-future-time");
		const futureWeatherIcons = document.getElementsByClassName("js-future-weather-icon");
		const futureTemps = document.getElementsByClassName("js-future-temp");
		
		for (let i = 0; i < (1 + futureTimes.length); ++i) {
			const time = JSONobj.list[i].dt_txt;
			const weatherIcon = JSONobj.list[i].weather[0].icon;
			const weatherIconAttr = "data-js-weather-icon";
			const temp = Math.round(JSONobj.list[i].main.temp);
			
			if (i === 0) {
				currentTime.textContent = timeGetter.displayTime(time, true);
				currentWeatherIcon.setAttribute(weatherIconAttr, weatherIcon);
				currentTemp.textContent = temp;
			}
			
			else {
				futureTimes[i-1].textContent = timeGetter.displayTime(time);
				futureWeatherIcons[i-1].setAttribute(weatherIconAttr, weatherIcon);
				futureTemps[i-1].textContent = temp;
			}
		}
		
	}
	
})();

// Convert time to am/pm format, given the UTC 24-hour format time on Open Weather Map

const timeGetter = new (function () {
		
		function getUTCDateString(openWeatherMapDate) {
			// Open Weather Map date format: "2019-04-25 17:00:00"
			// Change it to UTC date string: "2019-04-25T17:00:00Z"			
			const dateArray = openWeatherMapDate.split(" ");
			const UTCDateString = String.prototype.concat(dateArray[0], "T", dateArray[1], "Z");
			return UTCDateString;
		}
		
		function getAmPmHours(hourIn24h) {
			/* return an object in the form of:
				{
					"hour": 10,
					"tt": "pm"
				}
			*/
			
			if (!((hourIn24h >= 0) && (hourIn24h <= 23) && (Math.floor(hourIn24h) === hourIn24h))) {
				throw new RangeError("hourIn24h must be an integer in [0, 23]");
			}
			
			const am = "am", pm = "pm";
			
			const result = new (function () {
				this.hour = 1;
				this.tt = am;
			})();
				
			if ((hourIn24h >= 0) && (hourIn24h <= 11)) {
				if (hourIn24h === 0) {
					result.hour = 12;
				}
				else {
					result.hour = hourIn24h;
				}
				result.tt = am;
			}
			else {
				if (hourIn24h === 12) {
					result.hour = 12;
				}
				else {
					result.hour = hourIn24h - 12;
				}
				result.tt = pm;
			}
			
			return Object.freeze(result);
		}
		
		Object.defineProperty(this, "displayTime", {
			value: function (openWeatherMapDate, doNotShowMinutes = false) {
				const UTCDateString = getUTCDateString(openWeatherMapDate);
				const date = new Date(UTCDateString);
				
				const hourObj = getAmPmHours(date.getHours());
				const hour = hourObj.hour;
				const tt = hourObj.tt;
				
				const minutes = date.getMinutes();
				
				if (doNotShowMinutes) {
					return String.prototype.concat(hour, tt);
				}
				else if (minutes < 10) {
					return String.prototype.concat(hour, ":0", minutes, " ", tt);
				}
				else {
					return String.prototype.concat(hour, ":", minutes, " ", tt);
				}
				
			}
		});
		
	}
)();

requestMaker.search("Davis,US");

