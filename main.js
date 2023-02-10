const express = require('express')
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

var app = express();
var selectedPog;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('./static'));

app.set('view engine', 'ejs');
let rawdata = fs.readFileSync('pogs.json')
let poglist = JSON.parse(rawdata)
console.log(poglist);

app.get('/', function (req, res) {
  res.render('index', { pog: poglist });
});
app.get('/pog', function (req, res) {
  console.log(req.query.name);
  let pogName = req.query.name;
  console.log(pogName);
  for (let pogs of poglist.pogs) {
    if (pogs.name === pogName) {
      selectedPog = pogs;
      break;
    }
  }
  console.log(selectedPog);
  res.render('pog', { pog: selectedPog });
});


app.listen(1024);
console.log(`You're running on port 1024.`)
