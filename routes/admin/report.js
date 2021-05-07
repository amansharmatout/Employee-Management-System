const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const Blog = require("../../models/blog");
const Comment = require("../../models/comment");
const Company = require("../../models/company");
const Department = require("../../models/department");
const expressSanitizer = require("express-sanitizer");
const Employee = require("../../models/employee");
const Project = require("../../models/project");
const Payroll = require("../../models/payroll");
const tasks = require("../../models/tasks");
const middleware = require("../../middleware");
var objectId = require("mongoose").Types.ObjectId;
const report = require("../../models/report");

var request = require("request");
var allBlogs;

Blog.find({}, function (err, blogs) {
	if (err) {
		console.log(err);
	} else {
		allBlogs = blogs;
	}
});

router.get("/", middleware.isLoggedInAsAdmin, (req, res) => {
	report
		.find({})
		.populate({ path: "emp_id", select: "first_name , last_name" })
		.populate("tasks")
		.exec((err, docs) => {
			if (!err) {
				console.log("docs", docs[0]);
				res.render("admin/report/index", {
					reports: docs,
					blogs: allBlogs,
				});
			} else
				console.log(
					err +
						"Something went wrong...   " +
						JSON.stringify(err, undefined, 2),
				);
		});
});
router.get("/:id", middleware.isLoggedInAsAdmin, (req, res) => {
	report
		.findById(req.params.id)
		.populate({ path: "emp_id", select: "first_name , last_name" })
		.populate("tasks")
		.exec((err, docs) => {
			if (!err) {
				console.log("docs", docs);
				res.render("admin/report/view", {
					report: docs,
					blogs: allBlogs,
				});
			} else
				console.log(
					err +
						"Something went wrong...   " +
						JSON.stringify(err, undefined, 2),
				);
		});
});
module.exports = router;
