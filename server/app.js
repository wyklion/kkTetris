/**
 * Created by kk on 2016/4/27.
 */

var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var mongoStore = new MongoStore({ url: 'mongodb://localhost/tetris' });
var sessionMidleware = session({
   secret: 'secret',
   cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 14
   },
   resave: false,
   saveUninitialized: true,
   store: mongoStore,
});
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var router = require('./routes/router');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sessionMidleware);

var allowOrigins = [
   'http://kktetris.top',
   'http://www.kktetris.top',
   'http://140.143.128.60',
   'http://localhost',
];

app.use(function (req, res, next) {
   res.locals.user = req.session.user;   // 从session 获取 user对象
   var err = req.session.error;   // 获取错误信息
   delete req.session.error;
   res.locals.message = "";   // 展示的信息 message
   if (err) {
      res.locals.message = '<div class="alert alert-danger" style="margin-bottom:20px;color:red;">' + err + '</div>';
   }
   if (allowOrigins.indexOf(req.headers.origin) > -1) {
      res.header("Access-Control-Allow-Origin", req.headers.origin);
   }
   res.header('Access-Control-Allow-Credentials', true);
   res.header("Access-Control-Allow-Headers", "X-Requested-With,Cookie,Content-Type");
   res.header("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
   res.header("X-Powered-By", 'kk')
   res.header("Content-Type", "application/json;charset=utf-8");

   next();  // 中间件传递
});

app.use('/', router);

exports = module.exports = app;
exports.mongoStore = mongoStore;
exports.sessionMidleware = sessionMidleware;
