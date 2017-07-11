'use strict';

const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const path = require('path');
const s3Service = require('./../services/s3Service');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn('/login');

let log = console.log.bind(console);
let uploadsFolderPath = path.join(__dirname, '../uploads/');

router.post('/', ensureLoggedIn, (req, res) => {
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
    s3Service.uploadFile(uploadsFolderPath, fileName);
  });
});

module.exports = router;
