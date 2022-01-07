const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const morgan = require('morgan')
const { engine } = require('express-handlebars');
const methodOverride = require('method-override')
const connectDB = require('./config/db')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')



// Load config
dotenv.config({ path: './config/config.env' })

// Passport config
require('./config/passport')(passport)

connectDB();

const app = express()

//Body Parser
app.use(express.urlencoded({ extended: false}))
app.use(express.json())

//Method override
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    let method = req.body._method
    delete req.body._method
    return method
  }
}))

// Logging
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

const { indexing, total, ifCond, json } = require('./helpers/hbs')

// Handle bars
app.engine('.hbs', engine({helpers: {indexing, total, ifCond, json}, defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', '.hbs');

// Sessions
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI})
  }))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

//set global var
app.use((req, res, next) => {
  res.locals.user = req.user || null
  next()
})

// Static folder
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/customers', require('./routes/customers'))
app.use('/transaction', require('./routes/transaction'))
app.use('/null', require('./routes/null'))
app.use('/bill', require('./routes/bill'))

const PORT = process.env.PORT || 3003
app.listen(PORT, console.log(`Server running in ${ process.env.NODE_ENV } on port ${ PORT }`))