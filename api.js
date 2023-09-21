// Import required modules
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const port = process.env.PORT || 3000;

// Set the view engine to EJS
app.set('view engine', 'ejs');

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

// Error handling middleware
function errorHandler(err, req, res) {
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
}
// Route to list all available columns of a specified table
app.get('/:table', (req, res) => {
  const {
    table
  } = req.params; // Retrieve the 'table' variable from the URL

  // Query to get the table's schema and column names
  const query = `PRAGMA table_info(${table})`;

  db.all(query, (err, rows) => {
    if (err) {
      // Handle database error
      console.error('Database error:', err.message);
      return res.status(500).json({
        error: 'Database error'
      });
    }

    // Check if columns were found
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        error: 'No columns found'
      });
    }

    // Extract the column names
    const columns = rows.map((row) => row.name);
    res.json({
      columns
    });
  });
});
// Route to retrieve all entries from a specified table
app.get('/:table/all', (req, res) => {
  const {
    table
  } = req.params; // Retrieve the 'table' variable from the URL

  // Construct an SQL query to select all rows from the specified table
  const query = `SELECT * FROM ${table}`;

  // Execute the SQL query to retrieve all rows
  db.all(query, (err, rows) => {
    if (err) {
      // Handle database error
      console.error('Database error:', err.message);
      return res.status(500).json({
        error: 'Database error'
      });
    }

    // Check if rows were found
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        error: 'No data found'
      });
    }

    // Send the response with all rows' data
    res.json(rows);
  });
});

// Route to retrieve random entries from a specified table
app.get('/:table/random/:count?', (req, res) => {
  let {
    table,
    count
  } = req.params; // Retrieve the 'table' and 'count' variables from the URL
  const parsedCount = parseInt(count, 10);

  // Check if 'count' is a positive integer, default to 1 if not provided or invalid
  if (isNaN(parsedCount) || parsedCount <= 0) {
    count = 1;
  }

  // Construct an SQL query to select 'count' random rows from the specified table
  const query = `SELECT * FROM ${table} ORDER BY RANDOM() LIMIT ?`;

  // Execute the SQL query to retrieve 'count' random rows
  db.all(query, [count], (err, rows) => {
    if (err) {
      // Handle database error
      console.error('Database error:', err.message);
      return res.status(500).json({
        error: 'Database error'
      });
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
app.get('/:table/:column/:entry?', (req, res) => {
  const {
    table,
    column,
    entry
  } = req.params; // Retrieve the 'table', 'column', and 'entry' variables from the URL

  // Construct the SQL query dynamically based on whether an 'entry' parameter is present
  let query;
  let queryParams;

  if (entry) {
    query = `SELECT * FROM ${table} WHERE ${column} = ?`;
    queryParams = [entry];
  } else {
    // If no 'entry' parameter is provided, list all entries of that column
    query = `SELECT ${column} FROM ${table}`;
  }

  // Execute the SQL query
  db.all(query, queryParams, (err, rows) => {
    if (err) {
      // Handle database error
      console.error('Database error:', err.message);
      return res.status(500).json({
        error: 'Database error'
      });
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

// Add other routes and error handling as needed
app.get('/', (req, res) => {
  res.json({
    // message: 'Specify a table: Digipogs, pogColors, pogs Available columns: "name" "colors" "serial" "amount" "url" "lore" "tags" || "all" "random"'
    message: "Please specify a table to receive available columns: 'Digipogs', 'pogColors', 'pogs'"
  });
});