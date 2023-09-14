const express = require('express')
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();


var app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.static('./static'));

app.set('view engine', 'ejs');

const dbPath = path.join('./static', 'pog.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the database.');
  }
});

app.get('/', function (req, res) {
  db.all('SELECT * FROM pogs', [], (err, rows,) => {
    if (err) {
      console.error(err.message);
    }
    res.render('index', { rows: rows})
  });
});


app.get('/pog', function (req, res) {
  const pogName = req.query.name;
  db.get('SELECT * FROM pogs WHERE name = ?', [pogName], (err, row) => {
    if (err) {
      console.error(err.message);
    }
    row.colors = JSON.parse(row.color).colors;
    res.render('pog', { pog: row });
  });
});

app.listen(1024, () => {
  console.log(`You're running on port 1024.`);
});

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Closed the database connection.');
    process.exit(0);
  });
});