var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();

/* GET user profile. */
router.get('/', ensureLoggedIn, function (req, res, next) {
  var user = req.user;
  res.render('user', {
    user: user,
    email: user.emails ? user.emails[0].value : ''
  });
});

module.exports = router;
