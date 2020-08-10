var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var uuid4 =require('uuid4');

//router set
var mainRouter = require('./routes/main');
var videoRouter = require('./routes/video');
var videoGroupRouter = require('./routes/videoGroup');
var categoryRouter = require('./routes/category');
var tagRouter = require('./routes/tag');

var apiStreamRouter = require('./routes/api/stream');

//use session
var session = require('express-session');
var cors = require('cors');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//내부 참조용
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'hls')));

//stream file storage
app.use(cors());

//use session
app.use(session({
  secret: uuid4(),
  resave: false,
  saveUninitialized: true
}));

var sequelize = require('./models/index').sequelize;
sequelize.sync().then(() =>{
  console.log('[DB Connection Success]');
}).catch(err =>{
  console.log('[DB Connection Error]');
  console.log(err);
});

app.use(express.static(__dirname + '/'));

//router use
app.use('/', mainRouter);
app.use('/',videoRouter);
app.use('/', videoGroupRouter);
app.use('/', categoryRouter);
app.use('/', tagRouter);

//api - stream request
app.use('/api', apiStreamRouter);

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
