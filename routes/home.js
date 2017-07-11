'use strict';

const express = require('express');
const router = express.Router();
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn('/login');

router.get('/', ensureLoggedIn, (req, res, next) => {
  res.render('home', { userName: req.user.name });
});

// Demo workaround
router.get('/init', (req, res, next) => {
  res.render('init', { userName: req.user.name });
});

module.exports = router;