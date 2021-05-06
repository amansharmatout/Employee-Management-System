const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const Company = require("../models/company");

//landing page route
router.get("/", function (req, res) {
	res.render("landing");
});

//SHOW register form
router.get("/register", function (req, res) {
	res.render("register");
});

//handle registration logic
router.post("/register", function (req, res) {
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

	let newUser;

	Company.create(newCompany, function (err, newlyCreated) {
		if (err) {
			console.log(err);
		} else {
			var sel = req.body.user_role;
			newUser = new User({
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
					id: newlyCreated._id,
					ein: req.body.ein,
				},
			});

			console.log(newlyCreated);

			User.register(newUser, req.body.password, function (err, user) {
				if (err) {
					console.log(err);
					req.flash("error", err.message);
					return res.redirect("/register");
				}
				passport.authenticate("local")(req, res, function () {
					if (user.user_role === "Admin") {
						req.flash("success", "Welcome to E.M.S " + user.username);
						res.redirect("/homeadmin");
					} else if (user.user_role === "HOD") {
						req.flash("success", "Welcome to E.M.S " + user.username);
						res.redirect("/homehod");
					} else if (user.user_role === "HR") {
						req.flash("success", "Welcome to E.M.S " + user.username);
						res.redirect("/homehr");
					} else {
						req.flash("success", "Welcome to E.M.S " + user.username);
						res.redirect("/homeemployee");
					}
				});
			});
		}
	});
});

//SHOW login form
router.get("/login", function (req, res) {
	res.render("login");
});

//handle login logic
// router.post('/login', passport.authenticate('local', { successRedirect: '/home', failureRedirect: '/login' }), function(
// 	req,
// 	res
// ) {});
router.post("/login", function (req, res) {
	User.findOne({ username: req.body.username }, function (err, user) {
		if (err) {
			console.log(err);
			req.flash("error", err.message);
			res.redirect("/");
		} else {
			if (user != null && user.company_name === req.body.company_name) {
				console.log(user.company_name, user);
        var Login=user;
				if (user.user_role === "Admin") {
					passport.authenticate("local")(req, res, function () {
						res.redirect("/homeadmin");
					});
				} else if (user.user_role === "HOD") {
					passport.authenticate("local")(req, res, function () {
						res.redirect("/homehod");
					});
				} else if (user.user_role === "HR") {
					passport.authenticate("local")(req, res, function () {
						res.redirect("/homehr");
					});
				} else {
					console.log("else index.js", user);
					// passport.authenticate('local', { successRedirect: '/homeemployee',
					//                          failureRedirect: '/login' });
					// passport.authenticate('local')(req, res, function() {
					//   console.log("authenticate ", req, res );
					// 	res.redirect('/homeemployee');
					// });
					passport.authenticate("local", function (err, user, info) {
						console.log("logger", Login, err, info);
						// if (err) {
						// 	console.log(err);
						//   res.next(err)
						// }
						// if (!user) {
						// 	return res.redirect("/login");
						// }
						req.logIn(Login, function (err) {
							if (err) {
								console.log(err);
							}
							console.log("/users/" + Login.username);
							res.redirect("/homeemployee");
						});
					})(req, res, undefined);
				}
			} else {
				req.flash("error", "Oops something went wrong please try again");
				res.redirect("/");
			}
		}
	});
});

//Handle logout logic
router.get("/logout", function (req, res) {
	req.logout();
	req.flash("success", "Logged you out!");
	res.redirect("/");
});

module.exports = router;
