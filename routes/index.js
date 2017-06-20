var express = require('express');
var passport = require('passport');
var router = express.Router();
var formidable = require('formidable');
var path = require('path');
var fs = require('fs');

var env = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:5000/callback'
};

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('user');
});

router.post('/upload', (req, res) => {
  var form = new formidable.IncomingForm();
  form.uploadDir = path.join(__dirname, '../uploads');
  form.keepExtensions = true;
  form.parse(req);

  form.on('fileBegin', function (name, file) {
    file.path = path.join(form.uploadDir, file.name);
  });

  form.on('file', function (name, file) {
    console.log('Uploaded ' + file.name);
  });

  form.on('error', function (err) {
    console.log("an error has occured with form upload");
    console.log(err);
    //request.resume();
  });

  form.on('aborted', function (err) {
    console.log("user aborted upload");
  });

  form.on('end', function () {
    console.log('-> upload done');
  });
});

router.get('/video', function (req, res) {
  var filename = '2017.6.20-16.27.13.webm'
  var filePath = path.join(__dirname, '../uploads/' + filename);
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

    console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);
    var file = fs.createReadStream(filePath, { start: start, end: end });
    res.writeHead(206, {
      'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/webm'
    });
    file.pipe(res);
  } else {
    console.log('ALL: ' + total);
    res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/webm' });
    fs.createReadStream(filePath).pipe(res);
  }
});

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
