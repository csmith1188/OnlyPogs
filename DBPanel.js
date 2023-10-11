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
var port = 3000; // Change to your desired port number

// Connect to the SQLite database
var db = new sqlite3.Database('./static/pog.db');

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the DBPanel.ejs template from the root URL
app.get('/', (req, res) => {
    // Query the 'pogs' table and retrieve all columns for all rows
    db.all('SELECT * FROM pogs', [], (err, rows) => { // Use '*' to select all columns
        if (err) {
            console.error(err.message);
            res.status(500).json({
                error: 'Internal Server Error'
            });
            return;
        }

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
        if (err) {
            console.error('Error updating database:', err.message);
            res.status(500).json({
                error: 'Internal Server Error'
            });
            return;
        }

        console.log('Data saved successfully');
        res.status(200).json({
            message: 'Data saved successfully'
        });
    });
});

// Handle deleting a row
app.post('/delete/:uid', (req, res) => {
    var uid = req.params.uid;

    // Construct the SQL DELETE statement
    var sql = 'DELETE FROM pogs WHERE uid = ?';

    // Execute the delete query
    db.run(sql, [uid], (err) => {
        if (err) {
            console.error('Error deleting from database:', err.message);
            res.status(500).json({
                error: 'Internal Server Error'
            });
            return;
        }

        console.log('Data deleted successfully');
        res.status(200).json({
            message: 'Data deleted successfully'
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Close the database connection when the server is closed
app.on('close', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Database connection closed');
    });
});