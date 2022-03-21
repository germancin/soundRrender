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

	// console log
	// streamArray.length > 10 && console.log(streamArray.length);

};

const readInput = (err) => {
	console.log("Start Reading...")
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

	console.log(
		streamArray.length,
		">",
		toleranceLoud,
		(streamArray.length > toleranceLoud)
	);
	
	if (streamArray.length > toleranceLoud) {
		console.log("COLLECTING STREAM", streamArray.length);
		tolerance(streamArray.length);

		if (!toleranTimerOn) {
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

const assignValues = (reqBody) => {


	const toleranceValueRequest = reqBody.tolerance || null;
	const volumeThresholdRequest = reqBody.volumeThreshold || null;

	if (toleranceValueRequest) {
		toleranceLoud = toleranceValueRequest;
	}

	if (volumeThresholdRequest && toleranceValueRequest) {
		volumeThreshold = toleranceValueRequest * 3;
	}

	toleranceVal = 0;

	console.log(":UPDATE REQUEST:", reqBody);
	console.log(
		":volumeThreshold:",
		toleranceValueRequest,
		"(times 3)",
		volumeThreshold
	);

}

server.post("/updateSettings", (req, res) => {
	try {
		assignValues(req.body);

		

		statusOn && gpio.destroy(function () {

			console.log("All pins unexported");
			setTimeout(() => {
				console.log("Start Reading again....")
				assignValues(req.body);
				gpio.setup(channel, gpio.DIR_IN, gpio.EDGE_BOTH, readInput);
			}, 5000)

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
