const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const Blog = require('../../models/blog');
const Comment = require('../../models/comment');
const Company = require('../../models/company');
const Department = require('../../models/department');
const expressSanitizer = require('express-sanitizer');
const Employee = require('../../models/employee');
const Task = require('../../models/task');
const Project = require('../../models/project');
const Leave = require('../../models/leave');
const middleware = require('../../middleware');

// SHOW - show info about one specific company
router.get('/homeadmin/companies/:id', middleware.isLoggedInAsAdmin, async (req, res) => {
	try {
		const foundCompany = await Company.findById(req.params.id);
		const allBlogs = await Blog.find({});

		res.render('admin/companies/show', { company: foundCompany, blogs: allBlogs });
	} catch (err) {
		console.log(err);
		req.flash('error', err.message);
		return res.redirect('back');
	}
});

router.post("/admin/update", function (req, res) {
	let newCompany = new Company({
		name: req.body.company_name,
		city: req.body.company_city,
		type: req.body.company_type,
		address: req.body.company_address,
		email: req.body.company_email,
		phone: req.body.company_phone,
		size: req.body.company_size,
		description: req.body.company_description,
		ein: req.body.ein,
	});
	Company.findByIdAndUpdate(req.body._id, newCompany, (err, docs) => {
		if (!err) {
			// res.redirect('/homeadmin/companies/'+req.body._id);
			var user = {
				username: req.body.username,
				user_email: req.body.user_email,
				user_role: sel,
				company_name: req.body.company_name,
				company_email: req.body.company_email,
				company_phone: req.body.company_phone,
				company_address: req.body.company_address,
				company_type: req.body.company_type,
				company_city: req.body.company_city,
				company_size: req.body.company_size,
				company_description: req.body.company_description,
				company: {
					id: req.body._id,
					ein: req.body.ein,
				},
			};
			User.findByIdAndUpdate(req.body.emp_id, user, (err, docs) => {
				if (!err) {
					res.redirect("/homeadmin/companies/" + req.body._id);
				}
			});
		}
	});
});

// Delete - Delete a particular company
router.delete('/homeadmin/companies/:id', middleware.isLoggedInAsAdmin, async (req, res) => {
	try {
		const deletedCompany = await Company.findByIdAndRemove(req.params.id);
		const allUsers = await User.find({});
		const allDepts = await Department.find({});
		const allEmployees = await Employee.find({});
		const allTasks = await Task.find({});
		const allBlogs = await Blog.find({});
		const allComments = await Comment.find({});
		const allProjects = await Project.find({});
		const allLeaves = await Leave.find({});

		// delete users with company_name equal to the company name
		allUsers.forEach(async function(user) {
			if (user.company_name === deletedCompany.name) {
				const deletedUser = await User.findByIdAndRemove(user.id);
			}
		});

		// delete departments linked to this company
		allDepts.forEach(async function(department) {
			if (department.company === deletedCompany.name) {
				const deletedDept = await Department.findByIdAndRemove(department.id);
			}
		});

		// delete employees linked to this company
		allEmployees.forEach(async function(employee) {
			if (employee.company === deletedCompany.name) {
				const deletedEmployee = await Employee.findByIdAndRemove(employee.id);
			}
		});

		// delete projects linked to this company
		allProjects.forEach(async function(project) {
			if (project.company === deletedCompany.name) {
				const deletedProject = await Project.findByIdAndRemove(project.id);
			}
		});

		// delete blogs linked to this company
		allBlogs.forEach(async function(blog) {
			if (blog.ownedBy === deletedCompany.name) {
				const deletedBlog = await Blog.findByIdAndRemove(blog.id);
			}
		});

		// delete leaves linked to this company
		allLeaves.forEach(async function(leave) {
			if (leave.company === deletedCompany.name) {
				const deletedLeave = await Leave.findByIdAndRemove(leave.id);
			}
		});

		// delete tasks linked to this company
		allTasks.forEach(async function(task) {
			if (task.company.name === deletedCompany.name) {
				const deleteTask = await Task.findByIdAndRemove(task.id);
			}
		});

		return res.redirect('/');
	} catch (err) {
		console.log(err);
		req.flash('error', err.message);
		return res.redirect('back');
	}
});

module.exports = router;
