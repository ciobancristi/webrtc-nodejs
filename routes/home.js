'use strict';

const express = require('express');
const router = express.Router();
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn('/login');

router.get('/', ensureLoggedIn, (req, res, next) => {
  res.render('home', { userName: req.user.name });
});

module.exports = router;