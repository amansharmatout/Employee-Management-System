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
const middleware = require("../../middleware");

let today = new Date();
let dd = String(today.getDate()).padStart(2, "0");
let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
let yyyy = today.getFullYear();
today = dd + "/" + mm + "/" + yyyy;

let allBlogs;
Blog.find({}, function (err, blogs) {
	if (err) {
		console.log(err);
	} else {
		allBlogs = blogs;
	}
});

// INDEX - render index page to show options for attendances
router.get(
	"/homeemployee/employees/:id/attendances",
	middleware.isLoggedAsEmployee,
	(req, res) => {
		try {
			console.log("here get attendance ", req.params.id);
			Employee.findById(req.params.id, (err, docs) => {
				console.log(err,typeof(docs.attendances));
        if(err || !docs ) return res.redirect("back");
        console.log(docs.attendances);
        docs.attendances.splice[0,1];
        docs.attendances = docs.attendances.filter(function(item) {
          return item !== null;
      });
				return res.render("emp/attendances/index", {
					employee: docs,
					datenow: today,
					blogs: allBlogs,
				});
			});
		} catch (err) {
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("back");
		}
	},
);

// Update - update employee to set attendances
router.put(
	"/homeemployee/employees/:id/attendances",
	middleware.isLoggedAsEmployee,
	function (req, res) {
		Employee.findById(req.params.id, function (err, foundEmployee) {
			if (err) {
				console.log(err);
				res.redirect("back");
			} else {
				let today = new Date();
				let dd = String(today.getDate()).padStart(2, "0");
				let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
				let yyyy = today.getFullYear();
				let hour = today.getHours();
				let minute = today.getMinutes();

				if (minute.toString().length === 1) {
					minute = "0" + today.getMinutes();
				}

				today = dd + "/" + mm + "/" + yyyy;

				let currentTime = hour + ":" + minute;

				if (foundEmployee.hasOwnProperty("attendances")) {
					let attendance = {
						date: today,
						time: currentTime,
					};
					foundEmployee.attendances.push(attendance);
				} else {
					let attendance = {
						date: today,
						time: currentTime,
					};
					foundEmployee.attendances.push(attendance);
				}
        foundEmployee.attendances = foundEmployee.attendances.filter(function(item) {
          return item !== null;
      });
				foundEmployee.attendances = foundEmployee.attendances.filter(
					(v, i, a) => a.findIndex((t) => t.date === v.date) === i,
				);
				foundEmployee.save();

				if (foundEmployee.attendances.length >= 30) {
					var newPayroll = {
						employee: {
							id: req.params.id,
							employee_id: foundEmployee.employee_id,
						},

						start_date: foundEmployee.attendances[0].date,
						end_date:
							foundEmployee.attendances[foundEmployee.attendances.length - 1]
								.date,
					};
					foundEmployee.attendances.splice(0, foundEmployee.attendances.length);
					Payroll.create(newPayroll, function (err, newlyCreated) {
						if (err) {
							console.log(err);
						} else {
						}
					});
				}

				res.redirect(
					"/homeemployee/employees/" + req.params.id + "/attendances",
				);
			}
		});
	},
);

module.exports = router;
