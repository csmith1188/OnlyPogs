const express = require('express');
const app = express();
const path = require('path');
app.get ('/',
    function (request, response) {
      response.send("Hello!");
  }
)

app.set('view engine', 'ejs')

app.get('/hhh', function(req, res){
  res.render('OnlyPogs')
});

app.listen(3000);
