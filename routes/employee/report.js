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


router.post("/", (req, res) => {
	let tsk = [];
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
				res.render("emp/report/new", {
					employee: foundEmployee,
					blogs: allBlogs,
				});
      });
});
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
router.put("/", (req, res) => {
	let rep = new report({
		_id: req.body._id,
		Date: req.body.date,
		tasks: req.body.tasks,
		emp_id: req.body.emp_id,
	});
	report.findByIdAndUpdate(
		req.body._id,
		{ $set: rep },
		{ new: true },
		(err, docs) => {
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
router.delete("/:id", (req, res) => {
	report.findByIdAndDelete(req.params.id, (err, docs) => {
		if (!err) res.send(docs);
		else
			console.log(
				err + "Something went wrong...   " + JSON.stringify(err, undefined, 2),
			);
	});
});
module.exports = router;
