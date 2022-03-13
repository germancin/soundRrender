const portAudio = require("naudiodon");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const port = 5000;
const fs = require("fs");

const server = express();
server.use(bodyParser.json());
server.use(cors());

server.get("/", (req, res) => {
	try {

		console.log(portAudio.getHostAPIs());

		res.status(200).json({
			message: "Ok",
			payload: portAudio.getHostAPIs(),
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
