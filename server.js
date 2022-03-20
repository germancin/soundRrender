const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const port = 8000;
const fs = require("fs");
const spawn = require("child_process").spawn;
const gpio = require("rpi-gpio");
const channel = 11; // which is GPIO17 that is used in python.
const server = express();
const volume = 2000;
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
		

		const handleSoundStream = (stream) => {
			streamArray.push(stream);
			// console.log(streamArray.length);
		};

		const readInput = (err) => {
			try{
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
							if (err) {
								console.log("Error event", err);
								res.status(500).json({
									ping: channel,
									message: err.message,
								});
							}
						}

						changedValue && value && handleSoundStream(value);
					});
				});

				res.status(200).json({
					ping: channel,
					messge: "The sensor started listening succesfully.",
				});

			}catch(error){
				console.log("error", error)
				res.status(500).json({
					ping: channel,
					message: err.message,
				});
			}
			
		}

		const tolerance = (value) => {
			// console.log(
			// 	"got inot tolerance method",
			// 	value,
			// 	"currrent tolerance",
			// 	toleranceVal
			// );

			if (value > volume + 2000 && value > toleranceVal) {
				// console.log("HOLD ON COW BOY ", value);
			}

			toleranceVal = toleranceVal + value;

			if (toleranceVal > volume + 1500 && !sounded){
				console.log("YOU ARE TALKING TOO HIGH !!!!", toleranceVal);
				sounded = true;
				startCounter();
			}else{
				console.log("Ydoundede false??", sounded);
			}
				
		};

		setInterval(function () {
			if (streamArray.length > volume) {
				console.log("::::::GETTING  LOUGHT ", streamArray.length);
				tolerance(streamArray.length);
				startToleranceTimer();
			}

			streamArray = [];
		}, 3000);

		const startToleranceTimer = () => {
			let counter = 10;
			let interval = setInterval(function () {
				counter = counter - 1;
				console.log("tolerance", counter, toleranceVal)
				if (counter === 0) {
					clearInterval(interval);
					toleranceVal = 0;
				}
			}, 1000);
		};

		const startCounter = () => {
			let counter = 20
			let interval = setInterval(function () {
				counter = counter - 1
				console.log(" ::: can sound in", counter);
				if (counter === 0) {
					clearInterval(interval);
					sounded = false;
				}
			}, 1000);
		}
		
		

		gpio.setup(channel, gpio.DIR_IN, gpio.EDGE_BOTH, readInput);

	} catch (error) {
		res.status(500).json({
			error: error.message,
		});
	}
});

server.listen(port, (err) => {
	if (err) console.log(err);
	console.log(`server is listening on port ${port}`);

	gpio.on("export", function (channel) {
		console.log("Channel set: " + channel);
	});
});
