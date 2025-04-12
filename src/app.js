const log = console.log;
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const dbModle = require('../db/db');
dbModle.initializeDatabase();
app.use(cors());

const cookieParser = require('cookie-parser');

const ejs = require('ejs');
ejs.delimiter = '?';

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/order', require('./router/shared'));
app.use('/', require('./router/router'));

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing SQLite database');
    await dbModle.closeDatabase();
    process.exit(0);
});

module.exports = app;