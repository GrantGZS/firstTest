var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const layouts = require("express-ejs-layouts");
const axios=require('axios');
const auth=require('./routes/auth');

//crypto hash
const crypto=require('crypto');

const session = require("express-session"); 
const MongoDBStore = require('connect-mongodb-session')
(session);
// *********************************************************** //
//  Loading JSON datasets
// *********************************************************** //
const courses = require('./public/data/courses20-21.json')

// *********************************************************** //
//  Loading models
// *********************************************************** //

const Course = require('./models/Course')

// *********************************************************** //
//  Connecting to the database
// *********************************************************** //

const mongoose = require( 'mongoose' );
//const mongodb_URI = 'mongodb://localhost:27017/cs103a_todo'
const mongodb_URI = 'mongodb+srv://cs_sj:BrandeisSpr22@cluster0.kgugl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

mongoose.connect( mongodb_URI, { useNewUrlParser: true, useUnifiedTopology: true } );
// fix deprecation warnings
//mongoose.set('useFindAndModify', false); 
//mongoose.set('useCreateIndex', true);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {console.log("we are connected!!!")});
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var store = new MongoDBStore({
  uri: mongodb_URI,
  collection: 'mySessions'
});

// Catch errors
store.on('error', function(error) {
  console.log(error);
});

app.use(require('express-session')({
  secret: 'This is a secret 7f89a789789as789f73j2krklfdslu89fdsjklfds',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
  store: store,
  // Boilerplate options, see:
  // * https://www.npmjs.com/package/express-session#resave
  // * https://www.npmjs.com/package/express-session#saveuninitialized
  resave: true,
  saveUninitialized: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use(layouts)
app.use(auth)
app.use('/', indexRouter);
app.use('/users', usersRouter);


app.get('/uploadDB',
  async (req,res,next) => {
    await Course.deleteMany({});
    await Course.insertMany(courses);

    const num = await Course.find({}).count();
    res.send("data uploaded: "+num)
  }
)



app.get('/simpleform',
(req,res,next)=>{
  isLoggedIn,
  res.render('simpleform')
})
app.post('/simpleform',
 (req,res,next)=>{
   //res.json(req.body);
   
   const{username,age,height}=req.body;
   res.locals.username=username;
   res.locals.age=age;
   res.locals.version='1.0.0';
   res.locals.ageInDays=365*age;
   res.locals.heightInCM=2.54*height;
   res.render('simpleformresult');
 })
//bmi
app.get('/bmi',
(req,res,next)=>{
  res.render('bmi')
})
app.post('/bmi',
 (req,res,next)=>{
   //res.json(req.body);
   const{height,weight}=req.body;

   res.locals.bmi=weight/(height*height)*703
   res.render('bmiResult');
 })
//dist
app.get('/dist',
(req,res,next)=>{
  res.render('dist')
})
app.post('/dist',
 (req,res,next)=>{
   //res.json(req.body);
   const{x,y,z}=req.body;

   res.locals.distance=Math.sqrt(x*x+y*y+z*z)
   res.render('distResult');
 })
//family
const family=[
  {name:'Tim',age:66},
  {name:'Grant',age:22}
]
app.get('/showFamily',
  (req,res,next) => {
    res.locals.family = family;
    res.render('showFamily');
  })

//API and github repos
app.get('/apidemo/:email',
  async (req,res,next) => {
    const email = req.params.email;
    const response = await axios.get('https://www.cs.brandeis.edu/~tim/cs103aSpr22/courses20-21.json')
    console.dir(response.data.length)
    res.json(response.data.slice(100,105));
    res.locals.courses = response.data.filter((c) => c.instructor[2]==email+"@brandeis.edu")
    res.render('showCourses')

    
  })

app.get('/myApiDemo',
 async(req,res,next) =>{
   const response = await axios.get('https://api.stackexchange.com/2.3/questions/no-answers?order=desc&sort=activity&site=stackoverflow')
   console.dir(response.data.length)
   ///res.json(response.data.slice(100,102));
   //console.dir(response.data);
   res.locals.overflows=response.data.items
   res.render("showStackOverflows")
   
 })

  app.get('/githubInfo/:githubId',
  async (req,res,next) => {
    const id = req.params.githubId;
    const response = await axios.get('https://api.github.com/users/'+id+'/repos')
    console.dir(response.data.length)
    //res.json(response.data.slice(0,1));
    res.locals.repos = response.data
    res.render('showRepos')
    
  })
  ///Final project app
  //function character(){
    //let urlParameters=new URLSearchParams(window.location.search),

  //}
  app.get('/Marvel',
  async (req,res,next) =>{
    var baseURL="http://gateway.marvel.com/v1/public/comics";
    var timestamp=new Date().getTime();
    var publicKey="8d721bdf4a603c8f544ffc2a28e4aacc";
    log (currentValue.log || []).concat([song])
    var privateKey = process.env.privateKey;
    //var privateKey="d42519eca3d77bc6e3125b239c4c3c9a0a3c31dd";
    let hash=crypto.createHash('md5').update(timestamp+publicKey+privateKey).digest("hex");
    console.dir(hash);
    const hero=req.params.body;
    const response=await axios.get()
    console.dir(response.data.length)
    res.render('Marvel')
  })






// middleware to test is the user is logged in, and if not, send them to the login page
const isLoggedIn = (req,res,next) => {
  if (res.locals.loggedIn) {
    next()
  }
  else res.redirect('/login')
}




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
