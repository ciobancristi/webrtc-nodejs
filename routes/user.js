'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
const User = require('../models/user');
const emailService = require('../services/emailService');

router.get('/register', (req, res) => {
  res.render('register', {});
});

router.post('/register', (req, res) => {
  if (req.body.password !== req.body.confirmPassword) {
    res.send({ success: false, message: 'Passwords do not match!' });
    return;
  }

  var user = new User({
    username: req.body.username,
    name: req.body.name
  });

  User.register(user, req.body.password, (err, user) => {
    if (err) {
      return res.send({ success: false, message: err.message });
    }

    passport.authenticate('local')(req, res, () => {
      req.session.save((err) => {
        if (err) {
          return next(err);
        }
        res.send({ success: true, message: "User registered successfully" })
      });
    });
  });
});

router.get('/login', (req, res) => {
  res.render('login', { user: req.user });
});

router.post('/login', function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err); // will generate a 500 error
    }
    // Generate a JSON response reflecting authentication status
    if (!user) {
      return res.render('login', { message: 'Username or password incorrect' });
    }
    req.login(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect('/');
    });
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.get('/user-details', ensureLoggedIn, (req, res) => {
  res.render('user-details', { user: req.user, userName: req.user.name });
});

router.post('/user-details', ensureLoggedIn, (req, res) => {
  let user = req.body.user;
  let setObject = {
    $set: {
      name: req.body.fullName,
      securityCoEmail: req.body.securityCoEmail,
      emailTemplate: req.body.emailTemplate
    }
  }
  User.findByIdAndUpdate(req.user.id, setObject, { new: true }, function (err, user) {
    if (err) return console.log(err);

    req.session.passport.user.fullName = user.name;
    req.session.passport.user.securityCoEmail = user.securityCoEmail;
    req.session.passport.user.emailTemplate = user.emailTemplate;

    res.send({ success: true });
  })
});

router.post('/user/alert-security', ensureLoggedIn, (req, res) => {
  let securityCoEmail = req.user.securityCoEmail;
  let userName = req.user.name;
  let emailTemplate = req.user.emailTemplate;

  if (!securityCoEmail)
    res.send({ success: false, message: "Please set your security company email!" });

  emailService.sendMail(securityCoEmail, userName, emailTemplate, (response) => {

    if (response.success) {
      res.send({ success: true, message: "Email notification successfully sent to " + securityCoEmail });
    } else {
      res.send({ success: false, message: response.message });
    }
  });
});

module.exports = router;
