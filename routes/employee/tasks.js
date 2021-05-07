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
/**
 * @swagger
 * components:
 *   schemas:
 *     Tasks:
 *       type: object
 *       required:
 *         - task
 *         - time
 *         - description
 *       properties:
 *         _id:
 *           type: ObjectId
 *           description: The auto-generated id of the Report.
 *         task:
 *           type: string
 *           description: The title of task.
 *         time:
 *           type: string
 *           description: The time spent on task.
 *         description:
 *           type: string
 *           description: The description and doubts of task.
 *       example:
 *         _id: 128474612864178321
 *         task: "Employee Management System"
 *         time: 8
 *         description: "this is a simple management system."
 */

/**
 * @swagger
 * tags:
 *   name: Employee Management System
 *   description: The Employee  Management API
 */

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a task by ID.
 *     parameters: 
 *       - in: path
 *         name: id
 *         schema: 
 *           type: string
 *         required: true
 *     tags: [Employee Management System]
 *     responses:
 *       200:
 *         description: returns the task object of corresponding id
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Tasks'
 *       400:
 *         description: "No record with given id : "
 */
router.get("/:id", (req, res) => {
	if (!objectId.isValid(req.params.id))
		return res.status(400).send("No record with given id : " + req.params.id);
	tasks.findOne({ _id: req.params.id }, (err, docs) => {
		if (!err) res.send(docs);
		else
			console.log(
				`Something went wrong...     ${JSON.stringify(
					err,
					undefined,
					2,
				)}  ${err}`,
			);
	});
});
/**
 * @swagger
 * /tasks/:
 *   post:
 *     summary: Create a Task in db.
 *     tags: [Employee Management System]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tasks'
 *     responses:
 *       200:
 *         description: returns the created task object 
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Tasks'
 *       400:
 *         description: Somethinng went wrong...
 */
router.post("/", (req, res) => {
	var task = new tasks({
		task: req.body.task,
		time: req.body.time,
		description: req.body.description,
	});
	task.save((err, doc) => {
		if (!err) res.send(doc);
		else
			console.log(
				`Something went wrong...     ${JSON.stringify(
					err,
					undefined,
					2,
				)}  ${err}`,
			);
	});
});
/**
 * @swagger
 * /tasks/:
 *   put:
 *     summary: Update a Task in db.
 *     tags: [Employee Management System]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tasks'
 *     responses:
 *       200:
 *         description: returns the updated task object 
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Tasks'
 *       400:
 *         description: Somethinng went wrong...
 */
router.put("/", (req, res) => {
	var task = new tasks({
		_id: req.body._id,
		task: req.body.task,
		time: req.body.time,
		description: req.body.description,
	});
	tasks.findByIdAndUpdate(
		req.body._id,
		{ $set: task },
		{ new: true },
		(err, docs) => {
      console.log("tasks/// ", docs);
			if (!err) res.send(docs);
			else
				console.log(
					err +
						"Something went wrong...   " +
						JSON.stringify(err, undefined, 2),
				);
		},
	);
});

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: delete a Task in db.
 *     tags: [Employee Management System]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tasks'
 *     responses:
 *       200:
 *         description: returns the deleted task object 
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Tasks'
 *       400:
 *         description: Somethinng went wrong...
 */
router.delete("/:id", (req, res) => {
	tasks.findByIdAndDelete(req.params.id, (err, docs) => {
		if (!err) res.send(docs);
		else
			console.log(
				err + "Something went wrong...   " + JSON.stringify(err, undefined, 2),
			);
	});
});
/*
// INDEX - list all tasks
router.get('/homeemployee/tasks', middleware.isLoggedAsEmployee, async (req, res) => {
	try {
		const foundEmployee = await Employee.findById(req.user.employee.id);
		const allBlogs = await Blog.find({});
		const allTasks = await Task.find({});
		const foundDepartment = await Department.findById(req.user.department.id);

		allTasks.forEach(async function(task) {
			if (task.end === today) {
				let tsk = {
					status: 'Completed'
				};

				const updatedTask = await Task.findByIdAndUpdate(task.id, tsk);
			} else if (task.start === today) {
				let tsk = {
					status: 'In progress'
				};

				const updatedTask = await Task.findByIdAndUpdate(task.id, tsk);
			} else {
				let tsk = {
					status: 'Not started yet'
				};

				const updatedTask = await Task.findByIdAndUpdate(task.id, tsk);
			}
		});

		return res.render('emp/tasks/index', {
			employee: foundEmployee,
			blogs: allBlogs,
			tasks: allTasks,
			department: foundDepartment
		});
	} catch (err) {
		console.log(err);
		req.flash('error', err.message);
		return res.redirect('back');
	}
});

// SHOW - show info about one specific task
router.get('/homeemployee/tasks/:id', middleware.isLoggedAsEmployee, async (req, res) => {
	try {
		const foundEmployee = await Employee.findById(req.user.employee.id);
		const allBlogs = await Blog.find({});
		const foundTask = await Task.findById(req.params.id);
		const assignedEmployee = await Employee.findOne({ employee_id: foundTask.employee.employee_id });

		return res.render('emp/tasks/show', {
			employee: foundEmployee,
			blogs: allBlogs,
			task: foundTask,
			assignedEmployee: assignedEmployee
		});
	} catch (err) {
		console.log(err);
		req.flash('error', err.message);
		return res.redirect('back');
	}
});

*/
module.exports = router;
