//This is the OnlyPogs main.js file

//requiring indepencies
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

//OnlyPogs Port
const PORT = 1024

//formbar.js url
const AUTH_URL = 'http://172.16.3.118:1128/oauth'

//OnlyPogs url
const THIS_URL = 'http://172.16.3.107:1024/login'

const dbPath = path.join('./static', 'pog.db');

//creating a variable that is set to connect to the database
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the database.');
  }
});


/** A function that checks to see if there is a session token and if there is it redirects to the login endpoint*/
function isAuthenticated(req, res, next) {
  if (req.session.token) next()
  else res.redirect('/login')
};

app.use(express.urlencoded({ extended: true }));

app.use(express.static('./static'));

app.use(session({
  secret: 'D$jtDD_}g#T+vg^%}qpi~+2BCs=R!`}O',
  resave: false,
  saveUninitialized: false
}))


//Setting the view engine to look for ejs
app.set('view engine', 'ejs');

/**get endpoint that takes you to the account.ejs page */
app.get('/acc', (req, res) => {
  db.all('SELECT * FROM Digipogs', [], (err, rows) => {
    if (err) {
      console.log(err);
    };
    res.render('account', { rows: rows })
  })
})


/**
 * The following function is a get endpoint that takes you to the rewards.ejs page, it then creates a variable and sets it to the permissions
 * There is a db.all to select all from the rewards table in the pogs database
 * There is a db.get to select all from the Digipogs table of the pog database
 * Then it renders the rewards page with the rows from the rewards table and the perms from the Digipogs table
 */
app.get('/rewards', (req, res) => {
  //const userPerm = req.session.token.permissions
  db.all('Select * FROM rewards', [], (err, rows) => {
    //error validation
    if (err) {
      console.log(err)
      //TODO: send error template here
    }
    db.get('SELECT * FROM Digipogs', [], (err,) => {
      //error validation
      if (err) {
        console.log(err)
      } else {
        res.render('rewards', { rows: rows })
      }
    })
  })
})



app.post('/addItem', (req, res) => {
  const item = req.body.item
  const cost = req.body.cost
  const type = req.body.type
  db.run('INSERT INTO rewards (item, cost, type) VALUES (?, ?, ?)', [item, cost, type], (err) => {
    if (err) {
      console.log(err);
      //TODO: send error template here
    } else {
      res.redirect('/rewards')
    }
  });
})

app.post('/editItem', (req, res) => {
  const uid = req.body.uid
  const item = req.body.item
  const cost = req.body.cost
  const type = req.body.type
  console.log(`Uid: ${uid}`)
  console.log(item)
  console.log(cost)
  console.log(type)
  
  db.run('UPDATE rewards SET item = ?, cost = ?, type = ? WHERE uid = ?', [item, cost, type, uid], (err) => {
    if (err) {
      console.log(err);
      // TODO: send error template here
    } else {
      res.redirect('/rewards');
    }
  });;
})

app.post('/deleteItem', (req, res) => {
  const uid = req.body.uid
  console.log(uid)
  db.run('DELETE FROM rewards WHERE uid = ?', [uid], (err) => {
    if (err) {
      console.log(err);
      // TODO: send error template here
    } else {
      res.redirect('/rewards');
    }
  });
})

app.get('/rDetails', (req, res) => {
  res.render('rewardsDetails.ejs')
})

/**
 * This is an get endpoing that calls the isAuthenticated function when it runs
 */

app.get('/', /*isAuthenticated,*/ (req, res) => {
  //const userPerm = req.session.token.permissions
  //const userName = req.session.token.username
  try {
    db.all('SELECT * FROM pogs', [], (err, rows,) => {
      //error handling
      if (err) {
        console.error(err);
      }
      res.render('index', { rows: rows/*, userPerm : userPerm, userName : userName*/ })
    });
  }
  catch (error) {
    res.send(error.message);
  }
});

/**
Sends you to the /login endpoint
Sets tokenData to the sessions token data
Then redirects you do the root endpoint.
*/
app.get('/login', (req, res) => {
  if (req.query.token) {
    var tokenData = jwt.decode(req.query.token);
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
      const joinQuery = `SELECT * FROM pogs INNER JOIN pogColors ON pogs.uid = pogColors.parentID WHERE pogs.uid = ? AND pogColors.parentID = ?`
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

//Closes the database connection
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Closed the database connection.');
    process.exit(0);
  })
});

//Listens for connections on the specified port
app.listen(PORT, () => {
  console.log(`You're running on port ${PORT}.`)
})