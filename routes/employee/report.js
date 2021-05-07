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
 *     Report:
 *       type: object
 *       required:
 *         - date
 *         - emp_id
 *         - tasks
 *       properties:
 *         _id:
 *           type: ObjectId
 *           description: The auto-generated id of the Report.
 *         date:
 *           type: string
 *           description: The date of Report
 *         emp_id:
 *           type: ObjectId
 *           description: The id of Employee.
 *         leads:
 *           type: Array
 *           description: The id's of tasks of Report.
 *       example:
 *         date: 25/03/2021
 *         emp_id: 2342384764876423
 *         _id: 1897138916
 *         tasks: ["2379409238","28374278","78243972897"]
 *
 * */

/**
 * @swagger
 * components:
 *   schemas:
 *     Report_create:
 *       type: object
 *       required:
 *         - date
 *         - emp_id
 *         - time
 *         - tasks
 *         - desc
 *       properties:
 *         _id:
 *           type: ObjectId
 *           description: The auto-generated id of the Report.
 *         date:
 *           type: string
 *           description: The date of Report
 *         emp_id:
 *           type: ObjectId
 *           description: The id of Employee.
 *         time:
 *           type: Array
 *           description: an array of integer (representing hrs. in db).
 *         tasks:
 *           type: Array
 *           description: an array of string (representing task title in db).
 *         desc:
 *           type: Array
 *           description: an array of string (representing description of tasks in db).
 *       example:
 *         date: "25/03/2021"
 *         emp_id: "2342384764876423"
 *         _id: "1897138916"
 *         tasks: ["","task 1","task 2"]
 *         time: [0,43,12]
 *         desc: ["description ","description for task 1", "description for task 2"]
 *
 * */

/**
 * @swagger
 * tags:
 *   name: Employee Management System
 *   description: The Employee  Management API
 */

/**
 * @swagger
 * /report/:
 *   post:
 *     summary: creatre the report oject in db
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Report_create'
 *     tags: [Employee Management System]
 *     responses:
 *       200:
 *         description: returns the task object of corresponding id
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Report'
 *       400:
 *         description: "No record with given id : "
 */
router.post("/", (req, res) => {
  console.log(req.body);
	let requests = req.body.tasks.map((task) => {
		//create a promise for each API call
    if(task!='default'){
		return new Promise((resolve, reject) => {
        request(
          {
            uri: "http://localhost:3000/tasks/",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body:{
              task: task,
              time: req.body.time[req.body.tasks.indexOf(task)],
              description: req.body.desc[req.body.tasks.indexOf(task)],
            },
            json: true,
          },
          (err, res, body) => {
            if (err) {
              reject(err);
            }
            //call the resolve function which is passed to the executor                             //function passed to the promise
            resolve(body._id);
          },
        );
      });
		};
	});
	Promise.all(requests)
		.then((body) => {
			//this gets called when all the promises have resolved/rejected.
			let rep = new report({
				date: req.body.date,
				tasks: body,
				emp_id: req.body.emp_id,
			});
			rep.save((err, docs) => {
				if (!err) res.redirect('/report/employee/'+req.body.emp_id);
				else  
					console.log(
						err +
							"Something went wrong...   " +
							JSON.stringify(err, undefined, 2),
					);
			});
		})
		.catch((err) => console.log(err));
});
/**
 * @swagger
 * /report/employee/{id}:
 *   get:
 *     summary: Get all reports of an employee by ID.
 *     parameters: 
 *       - in: path
 *         name: id
 *         schema: 
 *           type: string
 *         required: true
 *     tags: [Employee Management System]
 *     responses:
 *       200:
 *         description: returns the array of report object of employee of corresponding id.
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Report'
 *       400:
 *         description: "No record with given id : "
 */
router.get('/employee/:id',(req,res)=>{
  report.find({emp_id:req.params.id}).populate({ path: "emp_id", select: "first_name , last_name" }).populate("tasks").exec().then((docs)=>{
    console.log(docs);    
      res.render("emp/report/index", {
        reports: docs,
        employee:docs[0].emp_id,
        blogs: allBlogs,
      });
  })
})

router.get('/employee/:id/new', middleware.isLoggedAsEmployee, (req, res) => {
			 Employee.findById(req.params.id).exec().then((foundEmployee) => {
         Project.find({},(err,docs)=>{
          res.render("emp/report/new", {
            projects:docs,
            employee: foundEmployee,
            blogs: allBlogs,
          });           
         })
      });
});
/**
 * @swagger
 * /report/{id}:
 *   get:
 *     summary: get a report by id
 *     parameters: 
 *       - in: path
 *         name: id
 *         schema: 
 *           type: string
 *         required: true
 *     tags: [Employee Management System]
 *     responses:
 *       200:
 *         description: returns the report object of corresponding id
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Report'
 *       400:
 *         description: "No record with given id : "
 */
router.get("/:id", (req, res) => {
	report
		.findById(req.params.id)
		.populate({ path: "emp_id", select: "first_name , last_name" })
		.populate("tasks")
		.exec((err, docs) => {
			if (!err) {
				res.send(docs);
			} else
				console.log(
					err +
						"Something went wrong...   " +
						JSON.stringify(err, undefined, 2),
				);
		});
});
/**
 * @swagger
 * /report/:
 *   put:
 *     summary: update the report oject in db
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Report_create'
 *     tags: [Employee Management System]
 *     responses:
 *       200:
 *         description: returns the task object of corresponding id
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Report'
 *       400:
 *         description: "No record with given id : "
 */
router.post("/update", (req, res) => {
	let requests = req.body.tasks.map((task) => {
		//create a promise for each API call
    if(task!='default'){
      return new Promise((resolve, reject) => {
          request(
            {
              uri: "http://localhost:3000/tasks/",
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body:{
                task: task,
                time: req.body.time[req.body.tasks.indexOf(task)],
                description: req.body.desc[req.body.tasks.indexOf(task)],
                _id: req.body.tid[req.body.tasks.indexOf(task)],
              },
              json: true,
            },
            (err, res, body) => {
              if (err) {
                reject(err);
              }
              //call the resolve function which is passed to the executor                             //function passed to the promise
              resolve(body._id);
            },
          );
      });
		}
	});
	Promise.all(requests)
		.then((body) => {
			//this gets called when all the promises have resolved/rejected.
			let rep = new report({
				date: req.body.date,
				tasks: body,
				emp_id: req.body.emp_id,
        _id: req.body._id
			});
			report.findByIdAndUpdate(
        req.body._id,
        { $set: rep },
        { new: true },
        (err, docs) => {
          console.log('report /// ',docs);
          if (!err)  res.redirect('/report/employee/'+docs.emp_id);
          else
            console.log(
              err +
                "Something went wrong...   " +
                JSON.stringify(err, undefined, 2),
            );
        },
      );
		})
		.catch((err) => console.log(err));




	// let rep = new report({
	// 	_id: req.body._id,
	// 	Date: req.body.date,
	// 	tasks: req.body.tasks,
	// 	emp_id: req.body.emp_id,
	// });
	// report.findByIdAndUpdate(
	// 	req.body._id,
	// 	{ $set: rep },
	// 	{ new: true },
	// 	(err, docs) => {
	// 		if (!err) res.send(docs);
	// 		else
	// 			console.log(
	// 				err +
	// 					"Something went wrong...   " +
	// 					JSON.stringify(err, undefined, 2),
	// 			);
	// 	},
	// );
});
/**
 * @swagger
 * /report/{id}:
 *   get:
 *     summary: delete a report by id
 *     parameters: 
 *       - in: path
 *         name: id
 *         schema: 
 *           type: string
 *         required: true
 *     tags: [Employee Management System]
 *     responses:
 *       200:
 *         description: returns the deleted report of corresponding id
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Report'
 *       400:
 *         description: "No record with given id : "
 */
router.delete("/:id", (req, res) => {
	report.findByIdAndDelete(req.params.id, (err, docs) => {
		if (!err) res.send(docs);
		else
			console.log(
				err + "Something went wrong...   " + JSON.stringify(err, undefined, 2),
			);
	});
});
router.get('/:id/edit',(req,res)=>{
  report.findById(req.params.id).populate({ path: "emp_id", select: "first_name , last_name" })
  .populate("tasks")
  .exec((err,docs)=>{
    if (!err &&  docs) {
      Project.find({},(err,projects)=>{
        if (!err &&  docs) {
          res.render('emp/report/edit',{
            blogs: allBlogs,
            employee: docs.emp_id,
            report: docs,
            projects: projects
          });
        }else{
          console.log(
            err +
              "Something went wrong...   " +
              JSON.stringify(err, undefined, 2),
          );
        }
      })
    } else
      console.log(
        err +
          "Something went wrong...   " +
          JSON.stringify(err, undefined, 2),
      );
  })
});
module.exports = router;
