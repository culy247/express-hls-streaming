var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config()
//router set
var videoRouter = require('./routes/video');
var cors = require('cors');
const busboy = require('connect-busboy');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(busboy({
  highWaterMark: 2 * 1024 * 1024, // Set 2MiB buffer
}));
app.set('view engine', 'ejs')
//stream file storage
app.use(cors());

app.use(express.static(__dirname + '/public'));

//router use
app.use('/api/',videoRouter);
app.route('/').get((req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});
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

module.exports = app;
