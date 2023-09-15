// Import required modules
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const port = process.env.PORT || 3000;

// Connect to the SQLite database
const db = new sqlite3.Database('static/pog.db', (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Middleware to parse JSON requests
app.use(express.json());

//Grab a random pog and display all of its data
app.get('/API-random', (req, res) => {
  // Construct an SQL query to select a random row from the table
  const query = 'SELECT * FROM pogs ORDER BY RANDOM() LIMIT 1';

  // Execute the SQL query to retrieve a random row
  db.get(query, (err, row) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }

    // Check if a row was found
    if (!row) {
      return res.status(404).json({ error: 'No data found' });
    }

    // Send the response with the random row's data
    res.json(row);
  });
});

//lists all data in a specifide column
// Availble columns: "name" "colors" "serial" "amount" "url" "lore" "tags"
app.get('/API-:column', (req, res) => {
  const {
    column
  } = req.params; // Retrieve the 'column' variable from the URL

  // Construct the SQL query dynamically with the specified column
  const query = `SELECT ${column} FROM pogs`;

  // Execute the SQL query
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({
        error: 'Server error'
      });
    }

    // Check if the retrieved data is empty or null
    if (!rows || rows.length === 0 || rows[0][column] === null) {
      return res.status(404).json({
        error: 'Data not found'
      });
    }

    // Extract the data and send the response
    const data = rows.map((row) => row[column]);
    res.json({
      [column]: data
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
app.get('/', (req, res) => {
  res.json({
    message: 'Availble columns: "name" "colors" "serial" "amount" "url" "lore" "tags" or "random" Place in front of the desired result "API-"'
  });
  // res.render('APIRoutes/index.ejs');
});