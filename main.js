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

app.get('/acc', (req, res) => {
  db.all('SELECT * FROM Digipogs', [], (err, rows) => {
    if(err) {
      console.log(err);
    };
    res.render('account', { rows: rows })
  })
})

app.get('/', function (req, res) {
  db.all('SELECT * FROM pogs', [], (err, rows,) => {
    if (err) {
      console.error(err);
    }
    res.render('index', { rows: rows })
  });
});

app.get('/pog', function (req, res) {
  const pogName = req.query.name;
  const parentID = req.query.parentID;

  // Use Promises for better error handling and parallel execution
  Promise.all([
    new Promise((resolve, reject) => {
      db.get('SELECT * FROM pogs WHERE name = ?', [pogName], (err, row) => {
        if (err) {
          console.error(err.message);
          reject(err);
          return;
        }
        if (!row) {
          // Handle the case where no data was found for the given name
          res.status(404).send('Pog not found');
          return;
        }
        row.colors = JSON.parse(row.color).colors;
        resolve(row);
      });
    }),
    new Promise((resolve, reject) => {
      db.all('SELECT * FROM pogColors WHERE parentID = ?', [parentID], (err, row) => {
        if (err) {
          console.error(err.message);
          reject(err);
          return;
        }
        console.log(parentID);
        resolve(row);
      });
    }),
  ])
    .then(([pogData, colorData]) => {
      // Both queries have completed successfully
      res.render('pog', { pog: pogData, color: colorData });
    })
    .catch((err) => {
      // Handle any errors that occurred during query execution
      res.status(500).send('An error occurred ' + err);
    });
}); 

  /*app.get('/pog', function (req, res) {
    const pogName = req.query.name
    const uid = req.query.uid;
    const parentID = req.query.parentID;
  
    // ... (The rest of your code)
  
    // Implement the INNER JOIN query here to retrieve combined data
    //This is important for cross referncing the uids and parentIDs from pogs and pogColors (Note that this doesn't fully work yet)
    const joinQuery = `SELECT * FROM pogs INNER JOIN pogColors ON pogs.uid = pogColors.parentID WHERE pogs.uid = ? AND pogColors.parentID = ?`;
  
    db.all(joinQuery, [uid, parentID], (err, joinedData) => {
      if (err) {
        console.error(err.message);
        res.status(500).send('An error occurred');
        return;
      }
  
      // Render the EJS template with the joined data
      res.render('pog', { pog: uid, color: parentID});
    });
  }); */


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