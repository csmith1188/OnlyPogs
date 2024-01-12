/*
  This file, "api.js," is the backend for API functionality, providing access to data from the SQLite database.
  The code contains routes to list available columns, retrieve all entries from a specified table, retrieve random entries, and list data in a specified column.
  It connects to the SQLite database and handles JSON requests, dynamically constructing SQL queries based on provided parameters.
*/

// Import required modules
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const port = process.env.PORT || 3000;

// Set the view engine to EJS
app.set('view engine', 'ejs');

/**
  Connect to the SQLite database.
  @type {sqlite3.Database}
*/
  const db = new sqlite3.Database('static/pog.db', (err) => {
    if (err) {
      console.error('Error connecting to SQLite database:', err.message);
    } else {
      console.log('Connected to SQLite database');
    }
  });

// Middleware to parse JSON requests
app.use(express.json());

/**
  Route to list all available columns of a specified table.
  @param {string} req.params.table - The name of the table to retrieve columns from.
  @returns {JSON} - JSON response containing the list of columns.
*/
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

/**
  Route to retrieve all entries from a specified table.
  @param {string} req.params.table - The name of the table to retrieve entries from.
  @returns {JSON} - JSON response containing all rows from the specified table.
*/
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

/**
  Route to retrieve random entries from a specified table.
  @param {string} req.params.table - The name of the table to retrieve random entries from.
  @param {string} req.params.count - The number of random entries to retrieve.
  @returns {JSON} - JSON response containing the specified number of random rows.
*/
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

/**
Route to list all data in a specified column.
  @param {string} req.params.table - The name of the table containing the desired column.
  @param {string} req.params.column - The name of the column to retrieve data from.
  @param {string} req.params.entry - (Optional) The specific entry within the column to retrieve.
  @returns {JSON} - JSON response containing the requested data.
*/
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
    // message: 'Specify a table: Digipogs, pogColors, pogs Available columns: "name" "color" "serial" "amount" "url" "lore" "tags" || "all" "random"'
    message: 'The route is designed to handle up to three parameters in the URL, structured as "table/column/entry." Table: The "table" parameter represents any table within the "pog.db" database. You can select from various tables available in the database, such as "pogs", "Digipogs", or "pogColors"; "pogs" of course having the most usability. Column: The "column" parameter allows you to specify which column you want to retrieve data from. You can choose any column from the selected table. Additionally, there are two special options: "all": Selecting "all" as the column will fetch all data from the chosen table, providing a comprehensive view of its contents. "random": Choosing "random" as the column will return a random from the table. If you specify a number as an extra parameter, it will fetch that many random entries (up to the maximum number of entries available in the table). Entry: The "entry" parameter allows you to pinpoint a specific entry within the selected column. If you provide a valid entry value, the route will retrieve all the data associated with that entry.'
  });
});