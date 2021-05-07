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
var middleware = require('../../middleware');

var allBlogs;
Blog.find({}, function(err, blogs) {
	if (err) {
		console.log(err);
	} else {
		allBlogs = blogs;
	}
});
/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - name
 *         - start
 *         - end
 *         - description
 *         - state
 *         - department
 *         - company
 *         - employees
 *       properties:
 *         _id:
 *           type: ObjectId
 *           description: The auto-generated id of the project
 *         name:
 *           type: string
 *           description: The name of project
 *         start:
 *           type: string
 *           description: The starting date of project.
 *         end:
 *           type: string
 *           description: The ending date of preoject.
 *         employees:
 *           type: Array
 *           description: The id's of employees who are working on this project.
 *         state:
 *           type: string
 *           description: The current state of project (e.g. In progress.).
 *         department:
 *           type: string
 *           description: The department of project.
 *         company:
 *           type: string
 *           description: The company working on the project.
 *         description:
 *           type: string
 *           description: The description of project.
 *       example:
 *         "_id" : "608bc55b25de9e16b474e896"
 *         "employees" : [ 4736487367238,78426378635876]
 *         "name" : "Management system"
 *         "start" : "2020-09-02"
 *         "end" : "2021-09-02"
 *         "department" : "development"
 *         "company" : "Tally"
 *         "state" : "In progress"
 *         "description" : "this is a grocery management system."
 *
 * */





var currentEmployee;
// INDEX - list all projects
router.get('/homeemployee/projects', middleware.isLoggedAsEmployee, function(req, res) {
	Employee.findById(req.user.employee.id, function(err, foundEmployee) {
		if (err) {
			console.log(err);
			req.flash('error', err.message);
			res.redirect('back');
		} else {
			Project.find({ company: req.user.company_name }, function(err, allProjects) {
				if (err) {
					console.log(err);
					req.flash('error', err.message);
					res.redirect('back');
				} else {
					currentEmployee = foundEmployee;
					res.render('emp/projects/index', {
						projects: allProjects,
						employee: foundEmployee,
						blogs: allBlogs
					});
				}
			});
		}
	});
});

// SHOW - show info about one specific project
router.get('/homeemployee/projects/:id', middleware.isLoggedAsEmployee, function(req, res) {
	Project.findById(req.params.id, function(err, foundProject) {
		if (err) {
			console.log(err);
			req.flash('error', err.message);
			res.redirect('back');
		} else {
			Employee.find({}, function(err, allEmployees) {
				if (err) {
					console.log(err);
					req.flash('error', err.message);
					res.redirect('back');
				} else {
					// not useful
					allEmployees.forEach(function(emp) {
						foundProject.employees.push(emp);
					});

					res.render('emp/projects/show', {
						project: foundProject,
						employees: allEmployees,
						employee: currentEmployee,
						blogs: allBlogs
					});
				}
			});
		}
	});
});

module.exports = router;
