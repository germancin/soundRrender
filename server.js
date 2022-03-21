const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const port = 7000;
const fs = require("fs");
const spawn = require("child_process").spawn;
const gpio = require("rpi-gpio");
const channel = 11; // which is GPIO17 that is used in python.
const server = express();
let toleranceLoud = 1;
let volumeThreshold = toleranceLoud * 3;
let streamArray = [];
let toleranceVal = 0;
let sounded = false;
let toleranTimerOn = false;
let statusOn = false;

server.use(bodyParser.json());
server.use(cors());


const handleSoundStream = (stream) => {
	streamArray.push(stream);
	// console.log(streamArray.length);
};

const readInput = (err) => {
	try {
		if (err) {
			console.log("Error Listening.", err);
		}

		gpio.on("change", function (channel, changedValue) {
			gpio.read(channel, function (err, value) {
				if (err) {
					console.log("Error event", err);
				}

				changedValue && value && handleSoundStream(value);
			});
		});
	} catch (error) {
		console.log("error", error);
	}
};

const tolerance = (value) => {
	toleranceVal = toleranceVal + value;

	console.log("WHAT DO WEHAVE", volumeThreshold);

	if (toleranceVal > volumeThreshold && !sounded) {
		const python = spawn("python", ["python/playmp3.py"]);

		console.log( ":::::::::::YOU ARE TALKING TOO HIGH :::::::::", toleranceVal );

		sounded = true;
		toleranceVal = 0;
		startCounter();

	} else {
		console.log("Ydoundede false??", sounded);
	}
};

setInterval(function () {

	if (streamArray.length > toleranceLoud) {

		console.log("COLLECTING STREAM", streamArray.length);
		
		if (!toleranTimerOn) {
			tolerance(streamArray.length);
			startToleranceTimer();
		}
	}

	streamArray = [];

}, 3000);

const startToleranceTimer = () => {
	let counter = 10;
	toleranTimerOn = true;
	let interval = setInterval(function () {
		counter = counter - 1;

		console.log("tolerance", counter, toleranceVal);

		if (counter === 0) {
			clearInterval(interval);
			toleranceVal = 0;
			toleranTimerOn = false;
		}
	}, 1000);
};

const startCounter = () => {
	let counter = 20;
	let interval = setInterval(function () {
		counter = counter - 1;
		console.log(" ::: can sound in", counter);
		if (counter === 0) {
			clearInterval(interval);
			sounded = false;
			toleranceVal = 0;
		}
	}, 1000);
};

server.post("/updateSettings", (req, res) => {
	try {
		const toleranceValueRequest = req.body.tolerance || null;
		const volumeThresholdRequest = req.body.volumeThreshold || null;

		if (toleranceValueRequest) {
			toleranceLoud = toleranceValueRequest * 3;
		}

		if (volumeThresholdRequest) {
			volumeThreshold = volumeThresholdRequest;
		}

		console.log(":UPDATE REQUEST:", req.body);
		console.log(":Tolerance:",toleranceValueRequest,"(times 3)", toleranceLoud);

		statusOn && gpio.destroy(function () {
			console.log("All pins unexported");
			
			gpio.setup(channel, gpio.DIR_IN, gpio.EDGE_BOTH, readInput);
		});

		if (!statusOn) {
			statusOn = true;
			gpio.setup(channel, gpio.DIR_IN, gpio.EDGE_BOTH, readInput);
		}

		res.status(200).json({
			message: "Update!",
			payload: req.body,
		});

	} catch (error) {
		console.log("WE HAVE AN ERROR HIUSTON", error.message);
	}
});

server.listen(port, (err) => {
	if (err) console.log(err);
	console.log(`server is listening on port ${port}`);

	gpio.on("export", function (channel) {
		console.log("Channel set: " + channel);
	});
});
