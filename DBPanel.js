/*
    This file is the backend for DBPanel.js, and is meant for developers only, do not merge this into the main ever. 
    This file serves to handles all interactions with the database whether that be editing, saving, deleting, or adding
*/
// Import necessary modules
var express = require('express');
var app = express();
var sqlite3 = require('sqlite3').verbose();
var bodyParser = require('body-parser');
var path = require('path');

// Set up middleware
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// Set the port number
var port = 3000;

// Connect to the SQLite database
var db = new sqlite3.Database('./static/pog.db');

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the DBPanel.ejs template from the root URL
app.get('/', (req, res) => {
    // Query the 'pogs' table and retrieve all columns for all rows
    db.all('SELECT * FROM pogs', [], (err, rows) => {

        //report an error if there is one
        if (err) {
            console.error(err.message);
            res.status(500).json({
                error: 'Internal Server Error'
            });
            return;
        }

        // report missing data if there are no rows in the database or if there is nothing in a row
        if (!rows || rows.length === 0) {
            console.log("No data found in the 'pogs' table.");
            res.status(500).json({
                error: 'No Data Found'
            });
            return;
        }

        // Send all rows to the EJS template
        res.render('DBPanel', {
            data: rows
        });
    });
});

// Handle editing a row
app.post('/edit/:uid', (req, res) => {
    var uid = req.params.uid;
    var updatedData = req.body;

    // Construct the SQL UPDATE statement
    var sql = `UPDATE pogs SET
               name = ?,
               color = ?,
               serial = ?,
               url = ?,
               lore = ?,
               tags = ?
               WHERE uid = ?`;

    // Execute the update query
    db.run(sql, [
        updatedData.name,
        updatedData.color,
        updatedData.serial,
        updatedData.url,
        updatedData.lore,
        updatedData.tags,
        uid
    ], (err) => {
        //whether the data was saved successful or not
        if (err) {
            console.error('Error updating database:', err.message);
            res.status(500).json({
                error: 'Internal Server Error'
            });
            return;
        } else {
            console.log('Data saved successfully');
        };
    });
});

// Handle deleting a row
app.post('/delete/:uid', (req, res) => {
    var uid = req.params.uid;

    // Construct the SQL DELETE statement
    var sql = 'DELETE FROM pogs WHERE uid = ?';

    // Execute the delete query, and report whether the data was saved successful or not
    db.run(sql, [uid], (err) => {
        if (err) {
            console.error('Error deleting from database:', err.message);
            res.status(500).json({
                error: 'Internal Server Error'
            });
            return;
        } else {
            console.log('Data deleted successfully');
        };
    });
});

// Route to add a new entry
app.post('/add-entry', (req, res) => {
    // Handle adding a new entry to the database
    const newEntry = req.body;

    // Insert the new entry into the 'pogs' table
    const sql = `INSERT INTO pogs (name, color, serial, amount, url, lore, tags) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [
        newEntry.name,
        newEntry.color,
        newEntry.serial,
        newEntry.amount,
        newEntry.url,
        newEntry.lore,
        newEntry.tags,
    ];
    //report whether the data was saved successful or not
    db.run(sql, params, (err) => {
        if (err) {
            console.error('Error adding the entry:', err.message);
            res.status(500).json({
                error: 'Internal Server Error'
            });
        } else {
            console.log('Entry added successfully');
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});