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
let gpioInstance = false;

server.use(bodyParser.json());
server.use(cors());

const handleSoundStream = (stream) => {
	streamArray.push(stream);
	// console log
	console.log(parseInt(streamArray.length + 83 / 11.003),  " => " ,streamArray.length);
};

const readInput = (err) => {
	console.log("Start Reading...")
	try {
		if (err) {
			console.log("Error Listening.", err); 
		}

		if (!gpioInstance) {
			gpioInstance = gpio.on("change", function (channel, changedValue) {
				gpio.read(channel, function (err, value) {
					if (err) {
						console.log("Error event", err);
					}
					changedValue && value && handleSoundStream(value);
				});
			});
		} 

	} catch (error) {
		console.log("error", error);
	}
};

const tolerance = (value) => {
	toleranceVal = toleranceVal + value;

	console.log(
		"toleranceVal > volumeThreshold",
		toleranceVal > volumeThreshold,
		toleranceVal
	);

	if (toleranceVal > volumeThreshold && !sounded) {
		try{
			gpio.destroy(function () {
				const python = spawn("python", ["python/playmp3.py"]);

				console.log(
					":::::::::::YOU ARE TALKING TOO HIGH :::::::::",
					toleranceVal,
					volumeThreshold
				);

				console.log("All pins unexported");
				console.log("Start Reading again....");

				gpio.setup(channel, gpio.DIR_IN, gpio.EDGE_BOTH, readInput);

				sounded = true;
				toleranceVal = 0;
				startCounter();
				// return;
			});
		}catch(error){
			console.log("Error::")
		}


	} else {
		console.log("Ydoundede false??", sounded);
	}
};

const initialInterval = () => {
	setInterval(function () {
		// console.log(
		// 	streamArray.length,
		// 	">",
		// 	toleranceLoud,
		// 	(streamArray.length > toleranceLoud)
		// );

		if(streamArray.length > volumeThreshold) {
			setTimeout(() => {
				spawn("python", ["python/playmp3.py"]);
			}, 5000)
		}

		if (streamArray.length > toleranceLoud) {
			// console.log("COLLECTING STREAM", streamArray.length);
			// tolerance(streamArray.length);

			// if (!toleranTimerOn) {
			// 	startToleranceTimer();
			// }
		}

		tolerance(streamArray.length);

		streamArray = [];

	}, 500);
}


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

	if (volumeThresholdRequest) {
		volumeThreshold = volumeThresholdRequest;
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
			console.log("Start Reading again....");
			assignValues(req.body);
			gpio.setup(channel, gpio.DIR_IN, gpio.EDGE_BOTH, readInput);
			return;
		});

		if (!statusOn) {
			statusOn = true;
			gpio.setup(channel, gpio.DIR_IN, gpio.EDGE_BOTH, readInput);
			initialInterval();
			return;
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
