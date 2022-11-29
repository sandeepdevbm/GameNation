var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs=require('express-handlebars')
const nocache = require("nocache");
var db=require('./config/connection')
var session = require('express-session')
var voucher_codes = require('voucher-code-generator');

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
const multer = require('multer')
const dotenv = require('dotenv').config()

var Handlebars=require('handlebars')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout : 'layout',layoutsDir: __dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge:600000}
}))

//  register helpers

Handlebars.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});

Handlebars.registerHelper('isCancelled',(value)=>{
  return value == 'canceled' || value == 'delivered' ? true : false
})

Handlebars.registerHelper('isStatus',(value)=>{
  return value <1  ? true : false
})


Handlebars.registerHelper('isStock',(value)=>{
  return value >0 && value < 11  ? true : false
})

Handlebars.registerHelper('noStock',(value)=>{
  return value == 0  ? true : false
})

Handlebars.registerHelper('multiply',(value,value2)=>{
  return (parseInt(value)*parseInt(value2))
})

Handlebars.registerHelper('walletStatus',(value)=>{
  return value < 0 ? true : false
})

Handlebars.registerHelper('offer',(value)=>{
  return value >1  ? true : false
})



// ___________________________________
 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(nocache());



db.connect((err)=>{
  if(err)
  console.log("Database not connected"+err);
  else console.log("Database Connected");
})


app.use('/', userRouter);
app.use('/admin', adminRouter);

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
 