var config = require('./config');

const fetch = require('node-fetch');

module.exports = {
	checkMTAStatus,
	getMTAStatus,
	getDownTime,
	getUpTimePercentage
}

function getCurrTime() {
	const d = new Date();
	return d.getTime()
}

//////// State Variables  ////////

const startTime = getCurrTime();
const msToSecFactor = 1000 * 60
var routeNumberToNormal = {};     // (key = routeNumber, val = status (true for normal, false for delayed))
var routeNumberToDelayStart = {}; // (key = routeNumber, val = delay start time)
var cumulativeDownTime = {};      // (key = routeNumber, val = cumulative delay time in ms)

//////// APIs for Front-end ////////

function getMTAStatus() {
	var d = {}
	for (key in routeNumberToNormal) {
		d[key] = routeNumberToNormal[key] ? "normal" : "delayed"
	}
	return d;
}

function getTotalDownTime(key) {
	const currTime = getCurrTime();
	const currDownTime = routeNumberToNormal[key] ? 0 : currTime - routeNumberToDelayStart[key]
	return cumulativeDownTime[key] + currDownTime
}

function getDownTime() {
	var d = {}
	for (key in cumulativeDownTime) {
		const totalDownTime = getTotalDownTime(key)
		d[key] = (totalDownTime / msToSecFactor).toFixed(2);
	}
	return d;
}

function getUpTimePercentage() {
	const d = {};
	const currTime = getCurrTime();
	const totalTime = currTime - startTime;
	for (key in cumulativeDownTime) {
		const totalDownTime = getTotalDownTime(key)
		d[key] = ((1 - (totalDownTime / totalTime)) * 100).toFixed(1) + "%";
	}
	return d;
}

//////// Processing MTA JSON Data ////////

const MTAStatusJsonUrl = config.MTA_JSON_URL
const API_Key          = config.MTA_API_KEY

function checkMTAStatus() {
	fetch(MTAStatusJsonUrl, {headers: {"x-api-key": API_Key}})
	    .then(res => res.json())
	    .then(json => processData(json));
	}

function processData(json) {
	var data = json;
	var time = data["lastUpdated"];
	const routeDetails = data["routeDetails"];
	const keys = Object.keys(routeDetails);
	for (const key in keys) {
		routeProcessing(routeDetails[key]);
	}
}

function initialization(routeNumber) {
	if (!(routeNumber in routeNumberToNormal)) {
		routeNumberToNormal[routeNumber] = true;
	}
	if (!(routeNumber in cumulativeDownTime)) {
		cumulativeDownTime[routeNumber] = 0.0;
	}
}

function routeProcessing(route) {
	var routeNumber = route["route"];
	initialization(routeNumber);

	var statusDetails = route["statusDetails"] == null ? [] : route["statusDetails"];
	const statusKeys = Object.keys(statusDetails);
	var normalStatus = true;
	for (const key in statusKeys) {
		const status = statusDetails[key]["statusSummary"];
		if (status.toLowerCase().includes("delay")) {
			normalStatus = false;
		}
	}
	updateStatus(routeNumber, normalStatus);
	return normalStatus;
}

function updateStatus(routeNumber, newStatus) {
	const lastStatus = routeNumberToNormal[routeNumber];
	if (lastStatus != newStatus) {
		if (newStatus == false) { // Train becomes delayed
			routeNumberToNormal[routeNumber] = false;
			routeNumberToDelayStart[routeNumber] = getCurrTime();
			console.log("The status of " + routeNumber + " was normal, but it is now delayed.");
		} else { // Train becomes normal
			routeNumberToNormal[routeNumber] = true;
			const delayStartTime = routeNumberToDelayStart[routeNumber]
			const delayEndTime = getCurrTime();
			const delayTimeInMS = delayEndTime - delayStartTime;
			cumulativeDownTime[routeNumber] = cumulativeDownTime[routeNumber] + delayTimeInMS
			delete routeNumberToDelayStart[routeNumber]
			const minutes = delayTimeInMS / msToSecFactor;
			console.log("The status of " + routeNumber + " was delayed, but it is now normal. It was delayed for " + minutes.toFixed(2) + " minutes.");
		}
	}
}