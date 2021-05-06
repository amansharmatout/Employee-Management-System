var express = require('express');
var router = express.Router();
var User = require('../../models/user');
var Blog = require('../../models/blog');
var Comment = require('../../models/comment');
var Company = require('../../models/company');
var Department = require('../../models/department');
var expressSanitizer = require('express-sanitizer');
var Employee = require('../../models/employee');
var Project = require('../../models/project');
var Payroll = require('../../models/payroll');
var Leave = require('../../models/leave');
var middleware = require('../../middleware');

var allBlogs;

Blog.find({}, function(err, blogs) {
	if (err) {
		console.log(err);
	} else {
		allBlogs = blogs;
	}
});

// INDEX - list all leaves
router.get('/homeemployee/leaves/employees/:id', middleware.isLoggedAsEmployee, (req, res) => {
	Leave.find({})
		.exec()
		.then((allLeaves) => {
			return Employee.findById(req.params.id).exec().then((foundEmployee) => {
				res.render("emp/report/index", {
					leaves: allLeaves,
					employee: foundEmployee,
					blogs: allBlogs,
				});
			});
		})
		.catch((err) => {
			console.log(err);
			req.flash('error', err.message);
			return res.redirect('back');
		});
});

// NEW - show a new leave form
router.get('/homeemployee/leaves/employees/:id/new', middleware.isLoggedAsEmployee, (req, res) => {
	Employee.findById(req.params.id)
		.exec()
		.then((foundEmployee) => {
			res.render("emp/report/new", {
				blogs: allBlogs,
				employee: foundEmployee,
			});
		})
		.catch((err) => {
			console.log(err);
			req.flash('error', err.message);
			return res.redirect('back');
		});
});

// CREATE - create a new leave
router.post('/homeemployee/leaves/employees/:id', middleware.isLoggedAsEmployee, function(req, res) {
	const newLeave = {
		category: req.body.category,
		start_date: req.body.start_date,
		end_date: req.body.end_date,
		reason: req.body.reason,
		employee: {
			id: req.user.employee.id,
			employee_id: req.user.username
		},
		company: req.user.company_name
	};

	Leave.create(newLeave, function(err, newlyCreated) {
		if (err) {
			console.log(err);
			req.flash('error', err.message);
			return res.redirect('back');
		}

		console.log(newlyCreated);
		req.flash('success', 'Leave application sent successfully');
		res.redirect('/homeemployee/leaves/employees/' + req.user.employee.id);
	});
});

// Destroy - delete a particular leave
router.delete('/homeemployee/leaves/:id', middleware.isLoggedAsEmployee, (req, res) => {
	Leave.findByIdAndRemove(req.params.id)
		.exec()
		.then((deletedLeave) => {
			req.flash('success', 'Leave removed successfully');
			return res.redirect('/homeemployee/leaves/employees/' + req.user.employee.id);
		})
		.catch((err) => {
			console.log(err);
			req.flash('error', err.message);
			return res.redirect('back');
		});
});
module.exports = router;
