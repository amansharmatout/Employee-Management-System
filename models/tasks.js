var mongoose = require("mongoose");

var tasks = new mongoose.Schema({
	task: String,
	time: Number,
	description: String,
	project_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Project",
	},
});

module.exports = mongoose.model("tasks", tasks, "tasks");
