const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const port = 8000;
const pin = 17;
const fs = require("fs");
const spawn = require("child_process").spawn;
const gpio = require("rpi-gpio").promise;

const server = express();
server.use(bodyParser.json());
server.use(cors());

server.get("/", (req, res) => {
	try {

		gpio.setup(pin, gpio.DIR_OUT).then((err) => {
			console.log("SETUP");
			gpio.read(pin, function (err, value) {
				console.log(value);
			});
		})

		res.status(200).json({
			message: "Ok",
			payload: JSON.stringify(spawn),
		});
		
	} catch (error) {
		res.status(500).json({
			error: error.message,
		});
	}
});

server.listen(port, (err) => {
	if (err) console.log(err);
	console.log(`server is listening on port ${port}`);
});
