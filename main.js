const express = require('express')
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

var app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static('./static'));

app.set('view engine', 'ejs');
let rawdata = fs.readFileSync('pogs.json')
let poglist = JSON.parse(rawdata)
console.log(poglist);

app.get('/', function(req, res) {
    res.render('pages/index', { pog: poglist} );
  });


app.listen(621);
console.log(`You're running on port 621. Monosodium Glutamate is good for your health.`)