const express = require('express');
const app = express();
const path = require('path');
app.get ('/',
    function (request, response) {
      response.send("Hello!");
  }
)

app.get('/hhh', function(req, res){
    var options = {
        root: path.join(__dirname)
    };

    var fileName = 'logo.jpg';
    res.sendFile(fileName, options, function (err) {
        if (err) {
            next(err);
        } else {
            console.log('Sent:', fileName);
        }
    });
});

app.listen(3000 (error) => {
  if (error) {
    console.log(error)
  } else {
    console.log('Started server on port 3000');
  }
});
