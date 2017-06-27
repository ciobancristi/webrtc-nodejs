const express = require('express');
const passport = require('passport');
const router = express.Router();
const formidable = require('formidable');
const path = require('path');
const s3uploadService = require('./../services/s3uploadService');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn('/login');

let log = console.log.bind(console);
let uploadsFolderPath = path.join(__dirname, '../uploads/');

router.get('/', ensureLoggedIn, (req, res, next) => {
  res.render('home', { userName: req.user.name });
});

router.post('/upload', ensureLoggedIn, (req, res) => {
  let form = new formidable.IncomingForm();
  form.uploadDir = uploadsFolderPath;
  form.keepExtensions = true;
  form.parse(req);
  let fileName = '';

  form.on('fileBegin', (name, file) => {
    fileName = file.name;
    file.path = path.join(form.uploadDir, file.name);;
  });

  form.on('file', (name, file) => {
    log(`Uploaded ${file.name} to disk`);
  });

  form.on('error', (err) => {
    log("an error has occured with form upload");
    log(err);
    request.resume();
  });

  form.on('aborted', (err) => {
    log("user aborted upload");
  });

  form.on('end', () => {
    log('-> disk upload done');
    s3uploadService.uploadFile(uploadsFolderPath, fileName);
  });
});

module.exports = router;
