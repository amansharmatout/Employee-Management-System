var mongoose = require("mongoose");
const tasks = require("./tasks");

var report = new mongoose.Schema({
	date: String,
	tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "tasks" }],
	emp_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Employee",
	},
});

module.exports = mongoose.model("report", report, "report");
