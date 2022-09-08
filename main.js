const express = require('express')
const bodyParser = require('body-parser');
const path = require('path');

var app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static('./static'));

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.render('pages/index', {
    });
  });

app.get('/test/gay', function(req, res) {
  res.render('pages/test/gay', {
  });
});

app.listen(621);
console.log(`You're running on port 621. Monosodium Glutamate is good for your health.`)