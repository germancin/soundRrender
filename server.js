const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const port = 8000;
const fs = require("fs");
const spawn = require("child_process").spawn;
const gpio = require("rpi-gpio");
const channel = 11; // which is GPIO17 that is used in python.
const server = express();
const volume = 1000;
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

			if (value > volume + 500 && value > toleranceVal) {
				// console.log("HOLD ON COW BOY ", value);
			}

			toleranceVal = toleranceVal + value;

			if (toleranceVal > volume + 999 && sounded === false){
				console.log("YOU ARE TALKING TOO HIGH !!!!", toleranceVal);
				sounded = true;

				// setInterval(function () {
				// 	console.log("soundede false");
				// 	sounded = false;
				// }, 15000);
			}else{
				console.log("Ydoundede false??", sounded);
			}
				
		};

		setInterval(function () {
			// console.log("Current count Stream Values ", streamArray.length);

			if (streamArray.length > volume + 100) {
				console.log("::::::GETTING  LOUGHT ", streamArray.length);
				tolerance(streamArray.length);
			}

			streamArray = [];
		}, 3000);

		setInterval(function () {
			// console.log("Tolerance got zero out!");
			toleranceVal = 0;
		}, 6000);

		
		

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
