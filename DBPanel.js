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
        // Report an error if there is one
        if (err) {
            console.error(err.message);
            res.status(500).json({
                error: 'Internal Server Error'
            });
            return;
        }

        // Report missing data if there are no rows in the database or if there is nothing in a row
        if (!rows || rows.length === 0) {
            console.log("No data found in the 'pogs' table.");
            res.status(500).json({
                error: 'No Data Found'
            });
            return;
        }

        // Send all rows and highest UID to the EJS template
        res.render('DBPanel', {
            data: rows,
            highestUID: 0 // Initialize with 0, it will be updated via AJAX
        });
    });
});

// Fetch the highest UID from the database
app.get('/get-highest-uid', (req, res) => {
    db.get('SELECT MAX(uid) AS highestUID FROM pogs', [], (err, row) => {
        if (err) {
            console.error('Error fetching highest UID:', err.message);
            res.status(500).json({
                error: 'Error fetching highest UID',
                details: err.message
            });
        } else {
            const highestUID = row ? row.highestUID : 0; // Default to 0 if there's no data
            res.json({
                highestUID
            });
        }
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
                    console.error('Error deleting from the database:', err.message);
                    res.status(500).json({
                        error: 'Internal Server Error'
                    });
                    return;
                } else {
                    console.log('Data deleted successfully');
                };
            });
        });

        // Handle adding a new entry
        app.post('/add-entry', (req, res) => {
            console.log("Add Entry");
            // Handle adding a new entry to the database
            const newEntry = req.body;
            console.log(newEntry);

            // Insert the new entry into the 'pogs' table
            const sql = `INSERT INTO pogs (uid, name, color, serial, amount, lore, tags, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            const params = [
                newEntry.uid,
                newEntry.name,
                newEntry.color,
                newEntry.serial,
                newEntry.amount,
                newEntry.lore,
                newEntry.tags,
                newEntry.url
            ];
            console.log(params);

            // Report whether the data was saved successfully or not
            db.run(sql, params, (err) => {
                if (err) {
                    console.error('Error adding the entry:', err.message);
                    return res.status(500).json({
                        error: 'Internal Server Error'
                    });
                } else {
                    console.log('Entry added successfully');
                    return res.status(200).json({
                        message: 'Entry added successfully'
                    });
                }
            });
        });

        // Start the server
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });