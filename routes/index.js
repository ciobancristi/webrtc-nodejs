var express = require('express');
var passport = require('passport');
var router = express.Router();
var formidable = require('formidable');
var path = require('path');

var env = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:5000/callback'
};

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('user');
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
})

module.exports = router;
