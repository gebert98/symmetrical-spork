// ----------------------------------   DEPENDENCIES  ----------------------------------------------
const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const path = require('path');
const pgp = require('pg-promise')();
const session = require('express-session');

// -------------------------------------  APP CONFIG   ----------------------------------------------

// Ensure SESSION_SECRET is set
if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable is required!');
}

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
});

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Body parser (now part of Express)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// -------------------------------------  DB CONFIG AND CONNECT   ---------------------------------------
const dbConfig = {
  host: 'db',
  port: 5432,
  database: process.env.POSTGRES_DB || 'default_db',
  user: process.env.POSTGRES_USER || 'default_user',
  password: process.env.POSTGRES_PASSWORD || 'default_password',
};
const db = pgp(dbConfig);

// Database connection test
db.connect()
  .then(obj => {
    console.log(
      `Database connection successful: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`
    );
    obj.done(); // success, release the connection
  })
  .catch(error => {
    console.error('ERROR connecting to the database:', error.message || error);
  });

// -------------------------------------  ERROR HANDLING  --------------------------------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// -------------------------------------  EXPORT APP  ------------------------------------------------
module.exports = app;

// -------------------------------------  ROUTES for login.hbs   ----------------------------------------------


// -------------------------------------  ROUTES for home.hbs   ----------------------------------------------

app.get('/', (req, res) => {
  res.render('pages/home', {
  });
});

// -------------------------------------  ROUTES for logout.hbs   ----------------------------------------------

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.render('pages/logout');
});

// -------------------------------------  START THE SERVER   ----------------------------------------------

app.listen(3000);
console.log('Server is listening on port 3000');