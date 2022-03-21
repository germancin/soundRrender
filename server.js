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

server.use(bodyParser.json());
server.use(cors());

server.get("/", (req, res) => {
	try {
		var dataToSend;
		// spawn new child process to call the python script
		const python = spawn("python", ["python/hello.py"]);

		// collect data from script
		python.stdout.on("data", function (data) {
			console.log("Pipe data from python script ...");
			dataToSend = data.toString();

			console.log("Python response:::", dataToSend);
		});

		// in close event we are sure that stream from child process is closed
		python.on("close", (code) => {
			console.log(`child process close all stdio with code ${code}`);
			// send data to browser
			res.status(200).json({
				message: "Python Response.",
				payload: dataToSend,
			});
		});
	} catch (error) {
		res.status(500).json({
			error: error.message,
		});
	}
});

server.get("/listen", (req, res) => {
	try {
		let streamArray = [];
		let toleranceVal = 0;
		let sounded = false;
		let toleranTimerOn = false;

		const handleSoundStream = (stream) => {
			streamArray.push(stream);
			console.log(streamArray.length);
		};

		const readInput = (err) => {
			try {
				console.log("Listening...");

				if (err) {
					console.log("Error listening", err);
					res.status(500).json({
						ping: channel,
						message: err,
					});
				}

				gpio.on("change", function (channel, changedValue) {
					gpio.read(channel, function (err, value) {
						if (err) {
							console.log("Error event", err);
							res.status(500).json({
								ping: channel,
								message: err.message,
							});
						}

						changedValue && value && handleSoundStream(value);
					});
				});

				res.status(200).json({
					ping: channel,
					messge: "The sensor started listening succesfully.",
				});
			} catch (error) {
				console.log("error", error);
				res.status(500).json({
					ping: channel,
					message: err.message,
				});
			}
		};

		const tolerance = (value) => {
			toleranceVal = toleranceVal + value;

			if (toleranceVal > volumeThreshold && !sounded) {
				const python = spawn("python", ["python/playmp3.py"]);
				console.log(
					"::::::::::::::::::::::::::::::::::YOU ARE TALKING TOO HIGH !!!!",
					toleranceVal
				);
				sounded = true;
				toleranceVal = 0;
				startCounter();
			} else {
				console.log("Ydoundede false??", sounded);
			}
		};

		setInterval(function () {
			if (streamArray.length > toleranceLoud) {
				console.log("::::::GETTING  LOUGHT ", streamArray.length);
				tolerance(streamArray.length);
				!toleranTimerOn && startToleranceTimer();
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
				console.log(" ::::Sound Allowed In:::: ", counter);

				if (counter === 0) {
					clearInterval(interval);
					sounded = false;
					toleranceVal = 0;
				}
			}, 1000);
		};

		gpio.setup(channel, gpio.DIR_IN, gpio.EDGE_BOTH, readInput);
	} catch (error) {
		res.status(500).json({
			error: error.message,
		});
	}
});

server.get("/playmp3", (req, res) => {
	try {
		const python = spawn("python", ["python/playmp3.py"]);

		python.stdout.on("data", function (data) {
			console.log("Pipe data from python script ...");
			dataToSend = data.toString();

			console.log("Python response:::", dataToSend);
		});

		// in close event we are sure that stream from child process is closed
		python.on("close", (code) => {
			console.log(`child process close all stdio with code ${code}`);
			// send data to browser
			res.status(200).json({
				message: "Python Response.",
				payload: dataToSend,
			});
		});
	} catch (error) {
		res.status(500).json({
			error: error.message,
		});
	}
});

let streamArray = [];
let toleranceVal = 0;
let sounded = false;
let toleranTimerOn = false;

const handleSoundStream = (stream) => {
	streamArray.push(stream);
	// console.log(streamArray.length);
};

const readInput = (err) => {
	try {
		console.log("Listening...");

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

		console.log(
			":::::::::::YOU ARE TALKING TOO HIGH :::::::::",
			toleranceVal
		);

		sounded = true;
		toleranceVal = 0;
		startCounter();
	} else {
		console.log("Ydoundede false??", sounded);
	}
};

setInterval(function () {
	if (streamArray.length > toleranceLoud) {
		// console.log("::::::GETTING  LOUGHT UPDATE", streamArray.length);
		tolerance(streamArray.length);
		!toleranTimerOn && startToleranceTimer();
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

		console.log("UPDATE SETTING:::::::::", req.body);

		if (toleranceValueRequest) {
			toleranceLoud = toleranceValueRequest * 3;
		}

		if (volumeThresholdRequest) {
			volumeThreshold = volumeThresholdRequest;
		}

		console.log(
			"::::::UPDATE SETTINGS:::",
			toleranceValueRequest,
			"(times 3)",
			toleranceLoud
		);

		// gpio.destroy(function () {
		// 	console.log("All pins unexported");
		// });

		// gpio.setup(channel, gpio.DIR_IN, gpio.EDGE_BOTH, readInput);

		const gpioInstance = gpio.setup(
			channel,
			gpio.DIR_IN,
			gpio.EDGE_BOTH,
			readInput
		);

		console.log("::gpioInstance::", gpioInstance);

	} catch (error) {
		console.log(error);
	}
});

server.listen(port, (err) => {
	if (err) console.log(err);
	console.log(`server is listening on port ${port}`);

	gpio.on("export", function (channel) {
		console.log("Channel set: " + channel);
	});
});
