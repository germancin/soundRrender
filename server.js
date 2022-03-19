const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const port = 8000;
const pin = 17;
const fs = require("fs");
const spawn = require("child_process").spawn;
const gpio = require("rpi-gpio");

const server = express();
server.use(bodyParser.json());
server.use(cors());

server.get("/", (req, res) => {
	try {

		console.log("SETUP", gpio);
		gpio.on('change', (pin, value) => {
		
			console.log("the value::", value)
			
		});
		
		gpio.setup(pin, gpio.DIR_IN, gpio.EDGE_BOTH);

		res.status(200).json({
			message: "Ok",
			payload: [],
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
	
	
	
gpio.on('change', (pin, value) => {
		
			console.log("the value::", value)
			
		});
		
		gpio.setup(pin, gpio.DIR_IN, gpio.EDGE_BOTH);
	
});


