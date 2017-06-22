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

var uploadsFolderPath = path.join(__dirname, '../uploads/');

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
    uploadFileInAWS(uploadsFolderPath, fileName);
  });
});

let uploadFileInAWS = (directory, fileName) => {
  log('started S3 upload')
  s3uploadService.uploadFile(directory, fileName);
}

router.get('/video/:id', function (req, res) {
  var fileId = req.params["id"];
  var fileName = getFileName(fileId);
  var filePath = path.join(uploadsFolderPath, fileName);
  var stat = fs.statSync(filePath);
  var total = stat.size;
  if (req.headers['range']) {
    var range = req.headers.range;
    var parts = range.replace(/bytes=/, "").split("-");
    var partialstart = parts[0];
    var partialend = parts[1];

    var start = parseInt(partialstart, 10);
    var end = partialend ? parseInt(partialend, 10) : total - 1;
    var chunksize = (end - start) + 1;

    var maxChunk = 1024 * 1024; // 1MB at a time
    if (chunksize > maxChunk) {
      end = start + maxChunk - 1;
      chunksize = (end - start) + 1;
    }

    log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);
    var file = fs.createReadStream(filePath, { start: start, end: end });
    res.writeHead(206, {
      'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/webm'
    });
    file.pipe(res);
  } else {
    log('ALL: ' + total);
    res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/webm' });
    fs.createReadStream(filePath).pipe(res);
  }
});

router.get('/recordings', (req, res) => {
  var viewModels = getRecordingViewModels(req);
  res.render('recordings', { videos: viewModels });
})

router.get('/recordings/:id', (req, res) => {
  var recordingId = req.params["id"];
  var fileName = getFileName(recordingId);
  var url = env.S3_BUCKET_URL + fileName;
  res.render('recording', { url: url })
})

var getAllVideoNames = () => {
  var fileNames = fs.readdirSync(uploadsFolderPath);
  var gitignoreFile = '.gitignore';

  return fileNames.filter(item => item !== gitignoreFile);
}

var stripFileExtension = (value) => {
  return value.replace('.webm', '');
}

var stripSpecialCharacters = (value) => {
  return value.replace(/\.|\-/g, '');
}

var getRecordingViewModels = (request) => {
  var videos = getAllVideoNames();

  return videos.map((value) => {
    var title = stripFileExtension(value);
    var id = stripSpecialCharacters(title)
    var url = request.protocol + '://' + request.get('host')
      + request.originalUrl + '/' + id;
    return {
      title: title,
      id: id,
      url: url
    };
  })
}

var getFileName = (fileId) => {
  var fileNames = getAllVideoNames();
  var indexOfFile = fileNames.map((value) => {
    var name = stripFileExtension(value);
    return stripSpecialCharacters(name);
  }).indexOf(fileId);

  if (indexOfFile !== -1)
    return fileNames[indexOfFile];

  return null;
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
