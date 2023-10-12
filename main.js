const express = require('express')
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { log } = require('console');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken')
const session = require('express-session')
const app = express();

app.use(express.urlencoded({ extended: true }));

const PORT = 1024
//formbar.js url
const AUTH_URL = 'http://172.16.3.106:420/oauth'

//OnlyPogs url
const THIS_URL = 'http://172.16.3.107:1024/login'


function isAuthenticated(req, res, next) {
  if (req.session.token) next()
  else res.redirect('/login')
};


app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'D$jtDD_}g#T+vg^%}qpi~+2BCs=R!`}O',
  resave: false,
  saveUninitialized: false
}))


app.use(express.static('./static'));

app.set('view engine', 'ejs');

const dbPath = path.join('./static', 'pog.db');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {

  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the database.');
  }
});

app.get('/acc', (req, res) => {
  db.all('SELECT * FROM Digipogs', [], (err, rows) => {
    if (err) {
      console.log(err);
    };
    res.render('account', { rows: rows })
  })
})



app.get('/rewards', (req, res) => {
  const digiPerm = req.query.permissions
  db.all('Select * FROM rewards', [], (err, rows) => {
    if (err) {
      console.log(err)
      //TODO: send error template here
    } 
      db.get('SELECT * FROM Digipogs',[], (err, digiPerm) => {
        if (err){
          console.log(err)
        }else {

          res.render('rewards', { rows: rows, digiPerm: digiPerm})
          console.log(rows)
        }

      })
      
    
  })
})

app.post('/rewards', (req, res) => {
  const uid = req.body.uid
  const item = req.body.item
  const cost = req.body.cost
  const type = req.body.type
  db.run('INSERT INTO rewards (uid, item, cost, type) VALUES (?, ?, ?, ?)', [uid, item, cost, type], (err) => {
    if (err) {
      console.log(err);
      //TODO: send error template here
    } else {
      res.redirect('/rewards')
      console.log(`A row has been inserted inserted into rewards as ${item}, ${cost}, ${type}`);
    }
  });
})

app.get('/rDetails', (req, res) => {
  res.render('rewardsDetails.ejs')
})

app.get('/', isAuthenticated, (req, res) => {
  const userPerm = req.session.token.permissions
  const userName = req.session.token.username
  try {
    db.all('SELECT * FROM pogs', [], (err, rows,) => {
      if (err) {
        console.error(err);
      }
      console.log(userPerm);
      db.get('SELECT * FROM Digipogs WHERE fbUserName = ?', userName, (err, data) => {
        if (!data) {
          db.run('INSERT OR REPLACE INTO Digipogs (fbUserName, permissions) VALUES (?, ?)', [userName, userPerm], (err) => {
            if (err) {
              console.log(err);
              //TODO: send error template here
            }else {
              console.log(`A row has been inserted inserted into digipogs as username:${userName}, permissions:${userPerm}`);
            }
          })
        } else {
          res.render('index', { rows: rows, user: userName, userPerm: userPerm })
        }
      })
    });
  }
  catch (error) {
    res.send(error.message);
  }
});

app.get('/login', (req, res) => {
  if (req.query.token) {
    let tokenData = jwt.decode(req.query.token);
    req.session.token = tokenData;

    res.redirect('/');
  } else {
    res.redirect(AUTH_URL + `?redirectURL=${THIS_URL}`);
  };
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
      const joinQuery = `SELECT * FROM pogs INNER JOIN pogColors ON pogs.uid = pogColors.parentID WHERE pogs.uid = ? AND pogColors.parentID = ?`;


      db.all(joinQuery, [], (err, row) => {
        if (err) {
          console.error(err.message);
          reject(err)
          res.status(500).send('An error occurred');
          return;
        }
        console.log(parentID);

        resolve(row);
      });
    }),
  ])

    .then(([pogData, colorData,]) => {
      // Both queries have completed successfully
      res.render('pog', { pog: pogData, color: colorData });
      console.log(colorData)
      console.log(pogData);
    })
    .catch((err) => {
      // Handle any errors that occurred during query execution
      res.status(500).send('An error occurred ' + err);
    })
})



app.listen(PORT, () => {
  console.log(`You're running on port ${PORT}.`);

});

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Closed the database connection.');
    process.exit(0);
  })
})