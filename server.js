const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const port = 5000;
const fs = require("fs");

const server = express();


server.post("/", (req, res) => {
	
	console.log("Req::", req)
	res.status(200).json({
		message: "Ok"
	});
	
});

server.listen(port, (err) => {
	if (err) console.log(err);
	console.log(`server is listening on port ${port}`);
});
