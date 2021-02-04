var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var statusRouter = require('./routes/status');
var uptimeRouter = require('./routes/uptime');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', statusRouter);
app.use('/status', statusRouter);
app.use('/uptime', uptimeRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000, function () {
console.log("Express server listening on port 3000");
});

app.set('view engine', 'pug')


var mtaUtils = require('./mtaUtils');

// MTA Check Parameters
var minutes = 0.066666, the_interval = minutes * 60 * 1000;

// Check MTA Status
setInterval(function() {
  console.log("Checking MTA Status.");
  mtaUtils.checkMTAStatus()
}, the_interval);

module.exports = app;
