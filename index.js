//references the local ENV file if not in a production environment
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
test1

//require and execute express so the app can run
const express = require('express');
const app = express();
//require mongoose to connect to mongodb
const mongoose = require('mongoose');
//require ejs mate for creating boilerplates
const ejsMate = require('ejs-mate');
//require path for normalizing path names
const path = require('path');
//require express-session so that sessions can be created
const session = require('express-session');
//require passport and then set the strategy
const passport = require('passport');
const LocalStrategy = require('passport-local');
//require error function for error passing
const ExpressError = require('./utils/expressError');
//require method override so we can handle non-get/post requests
const methodOverride = require('method-override');
//require connect-flash to show flash messages
const flash = require('connect-flash');
//require mongo-sanitize to stop mongo query characters from being submitted
const mongoSanitize = require('express-mongo-sanitize');
//require helmet
const helmet = require('helmet');
const User = require('./models/user');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/timeline';

//connect to mongodb
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

//error handling for mongodb connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
})

//require the member routes
const userRoutes = require('./routes/users');
const user = require('./models/user');

//execute EJS and EJS mate
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
//execute path for views directory
app.set('views', path.join(__dirname, 'views'))
//allows express to parse form data as url encoded data
app.use(express.urlencoded({ extended: true }))
//this tells express where static assets are held
app.use(express.static(path.join(__dirname, 'public')))
//execute methodoverride functionality
app.use(methodOverride('_method'))
//execute mongo-sanitize
app.use(mongoSanitize());


const sessionConfig = {
    name: 'HistoriaSession',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use((req, res, next) => {
    //makes user information available in every template
    res.locals.currentUser = req.user;
    //middleware for making flash message variables available in all templates
    res.locals.info = req.flash('info');
    res.locals.error = req.flash('error');
    next();
})

//direct requests to the member routes
app.use('/', userRoutes);

//route for the home page
app.get('/', (req, res) => {
    res.send('Future home page')
})

//route that is applied if all other routes fail
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no something went wrong'
    res.render('error.ejs', { err });
})

//set the port and start the app
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server open on port ${port}.`)
});
