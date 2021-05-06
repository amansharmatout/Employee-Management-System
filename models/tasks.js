var mongoose = require("mongoose");

var tasks = new mongoose.Schema({
	task: String,
	time: Number,
	description: String,
});

module.exports = mongoose.model("tasks", tasks, "tasks");
