const express = require('express');
const app = express();
const path = require('path');
app.get ('/',
    function (request, response) {
      response.send("Hello!");
  }
)


pogList = [
  {Name: 'pizza pog',
  Image: `Pizza_Pog.png`,
  SerialNum:'2223A05',
  Colors:'Red & Yellow,
    YearMade:''',
  Notes: '',
  YearMade:''},

  {Name: 'blapperture mesa pog',
  Image: `Blapperture_Mesa_Pog.png`,
  SerialNum: '',
  Colors:'',
  Notes: '',
  YearMade:''},

  {Name: 'ytech 22-23 software pog',
  Image: `YTech_22-23_Software_Pog.png`,
  SerialNum: '2223A04',
  Colors:'',
  Notes: 'Some were printed with the incorrect serial number (2223A02)',
  YearMade:'2022-2023'},

  {Name: 'ytech 22-23 #cp programming',
  Image: ``,
  SerialNum:'2223A02',
  Colors: 'Blue & Black, Black & Blue, Red & Blue, Gray & Blue',
  Notes:'',
  YearMade:'2022-2023'},

  {Name:'ghost pog',
  Image:`Ghost_Pog.png`,
  SerialNum:'',
  Colors:'',
  Notes: '',
  YearMade:''},

  {Name:'worse company pog',
  Image:`Worse_Company_Pog/png`,
  SerialNum:'',
  Colors:'',
  Notes: '',
  YearMade:''},

  {Name:'york tech cyber pog',
  Image:`York_Tech_Cyber_Pog.png`,
  SerialNum:'',
  Colors: 'Yellow, Green',
  Notes:'',
  YearMade:''},

  {Name:'pog champ pog',
  Image:``,
  SerialNum:'',
  Colors: 'Green, Gray',
  Notes:'',
  YearMade:''},

  {Name:'trey pog',
  Image:``,
  SerialNum:'',
  Colors:'',
  Notes: '',
  YearMade:''},

  {Name:'',
  Image:``,
  SerialNum:'',
  Colors:'',
  Notes: '',
  YearMade:''},
]


app.set('view engine', 'ejs')

app.get('/hhh', function(req, res){
  res.render('OnlyPogs')
});

app.listen(3000);
