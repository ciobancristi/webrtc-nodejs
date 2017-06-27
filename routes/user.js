const express = require('express');
const router = express.Router();
const passport = require('passport');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
const mongoose = require('mongoose');
const User = require('../models/user');

var env = {
  S3_BUCKET_URL: process.env.S3_BUCKET_URL,
  MONGODB: process.env.MONGODB
};

const db = mongoose.connect(env.MONGODB, { useMongoClient: true });

router.get('/register', (req, res) => {
  res.render('register', {});
});

router.post('/register', (req, res) => {
  if (req.body.password !== req.body.confirmPassword)
    res.redirect('register', { error: 'Passwords do not match!' });

  var user = new User({
    username: req.body.username,
    name: req.body.name
  });

  User.register(user, req.body.password, (err, user) => {
    if (err) {
      return res.render('register', { error: err.message });
    }

    passport.authenticate('local')(req, res, () => {
      req.session.save((err) => {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
    });
  });
});

router.get('/ping', (req, res) => {
  User.find((err, users) => {
    if (err)
      console.log(err);
    res.json(users);
  });

})

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

module.exports = router;
