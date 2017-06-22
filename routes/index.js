var express = require('express');
var passport = require('passport');
var router = express.Router();
var formidable = require('formidable');
var path = require('path');
var fs = require('fs');
const s3uploadService = require('./../services/s3uploadService');

var env = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:5000/callback',
  S3_BUCKET_URL: process.env.S3_BUCKET_URL
};

let log = console.log.bind(console);
let uploadsFolderPath = path.join(__dirname, '../uploads/');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('home');
});

router.post('/upload', (req, res) => {
  let form = new formidable.IncomingForm();
  form.uploadDir = uploadsFolderPath;
  form.keepExtensions = true;
  form.parse(req);
  let fileName = '';

  form.on('fileBegin', function (name, file) {
    fileName = file.name;
    file.path = path.join(form.uploadDir, file.name);;
  });

  form.on('file', function (name, file) {
    log('Uploaded ' + file.name);
  });

  form.on('error', function (err) {
    log("an error has occured with form upload");
    log(err);
    //request.resume();
  });

  form.on('aborted', function (err) {
    log("user aborted upload");
  });

  form.on('end', function () {
    log('-> upload done');
    s3uploadService.uploadFile(uploadsFolderPath, fileName);
  });
});

router.get('/recordings', (req, res) => {
  getRecordingViewModels(req, (viewModels) => {
    res.render('recordings', { videos: viewModels });
  });
})

router.get('/recordings/:id', (req, res) => {
  let recordingId = req.params["id"];
  let fileName = getFileName(recordingId);
  let url = env.S3_BUCKET_URL + fileName;
  res.render('recording', { url: url })
})

var stripFileExtension = (value) => {
  return value.replace('.webm', '');
}

var stripSpecialCharacters = (value) => {
  return value.replace(/\.|\-/g, '');
}

var getRecordingViewModels = (request, callback) => {
  s3uploadService.getAllFileNames((videos) => {
    var viewModels = mapRecordingViewModels(request, videos);
    return callback(viewModels);
  })
}

var mapRecordingViewModels = (request, videos) => {
  return videos.map((value) => {
    var title = stripFileExtension(value);
    var id = stripSpecialCharacters(title)
    var url = request.protocol + '://' + request.get('host') +
      request.originalUrl + '/' + id;
    return {
      title: title,
      id: id,
      url: url,
      fileName: value
    };
  })
}

var getFileName = (fileId) => {
  let day = fileId.substring(0, 2);
  let month = fileId.substring(2, 4);
  let year = fileId.substring(4, 8);
  let hour = fileId.substring(8, 10);
  let minutes = fileId.substring(10, 12);
  let seconds = fileId.substring(12, 14);

  return day + '.' + month + '.' + year + '-' +
    hour + '.' + minutes + '.' + seconds + '.webm';
}

// router.get('/login',
//   function (req, res) {
//     res.render('login', { env: env });
//   });

// router.get('/logout', function (req, res) {
//   req.logout();
//   res.redirect('/');
// });

// router.get('/callback',
//   passport.authenticate('auth0', { failureRedirect: '/url-if-something-fails' }),
//   function (req, res) {
//     res.redirect(req.session.returnTo || '/user');
//   });


module.exports = router;
