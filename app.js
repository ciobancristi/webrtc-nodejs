var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var dotenv = require('dotenv');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');

dotenv.load();

var app = express();

///////////////// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

///////////////// Config
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'ZkgEr3yzdLTKIZvgGtZR',
  resave: true,
  saveUninitialized: true
}));

///////////////// Passport
app.use(passport.initialize());
app.use(passport.session());

var User = require('./models/user');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

///////////////// Mongoose

mongoose.connect(process.env.MONGODB)

///////////////// Static

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

///////////////// Routes

var homeRoute = require('./routes/home');
var userRoute = require('./routes/user');
var recordingsRoute = require('./routes/recordings');
var uploadRoute = require('./routes/upload');

app.use('/', homeRoute);
app.use('/', userRoute);
app.use('/recordings', recordingsRoute);
app.use('/upload', uploadRoute);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

///////////////// Error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;