// Import required modules
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const port = process.env.PORT || 3000;
app.set('view engine', 'ejs');

// Connect to the SQLite database
const db = new sqlite3.Database('../static/pog.db', (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Middleware to parse JSON requests
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);

  // Handle specific types of errors
  if (err instanceof SyntaxError) {
    return res.status(400).json({
      error: 'Invalid JSON'
    });
  }

  // Handle database errors
  if (err instanceof sqlite3.DatabaseError) {
    return res.status(500).json({
      error: 'Database error'
    });
  }

  // Handle other errors
  res.status(500).json({
    error: 'Server error'
  });
});

// Grab a random pog and display all of its data
app.get('/random/:count?', (req, res) => {
  let {
    count
  } = req.params; // Retrieve the 'count' variable from the URL
  const parsedCount = parseInt(count, 10);

  // Check if 'count' is a positive integer, default to 1 if not provided
  if (isNaN(parsedCount) || parsedCount <= 0) {
    count = 1;
  }

  // Construct an SQL query to select 'count' random rows from the table
  const query = `SELECT * FROM pogs ORDER BY RANDOM() LIMIT ?`;

  // Execute the SQL query to retrieve 'count' random rows
  db.all(query, [count], (err, rows) => {
    if (err) {
      // Pass the error to the error handling middleware
      return next(err);
    }

    // Check if rows were found
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        error: 'No data found'
      });
    }

    // Send the response with the random rows' data
    res.json(rows);
  });
});

app.get('/all', (req, res) => {
  const query = `SELECT * FROM pogs`;

  db.all(query, (err, rows) => {
    if (err) {
      // Pass the error to the error handling middleware
      return next(err);
    }

    // Check if rows were found
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        error: 'No data found'
      });
    }

    // Send the response with the random rows' data
    res.json(rows);
  });
});

// Lists all data in a specified column
app.get('/:column/:entry?', (req, res) => {
  const {
    column,
    entry
  } = req.params; // Retrieve the 'column' and 'entry' variables from the URL

  // Construct the SQL query dynamically based on whether an 'entry' parameter is present
  let query;
  let queryParams;

  if (entry) {
    query = `SELECT * FROM pogs WHERE ${column} = ?`;
    queryParams = [entry];
  } else {
    // If no 'entry' parameter is provided, list all entries of that column
    query = `SELECT ${column} FROM pogs`;
  }

  // Execute the SQL query
  db.all(query, queryParams, (err, rows) => {
    if (err) {
      // Pass the error to the error handling middleware
      return next(err);
    }

    // Check if the retrieved data is empty
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        error: 'Data not found'
      });
    }

    // Extract the data and send the response
    if (entry) {
      res.json(rows);
    } else {
      const data = rows.map((row) => row[column]);
      res.json({
        [column]: data
      });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
app.get('/', (req, res) => {
  res.json({
    message: 'Available columns: "name" "colors" "serial" "amount" "url" "lore" "tags" || "all" "random"'
  });
});  