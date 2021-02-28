const express = require('express');
const app = express();
var cors = require('cors')
require("dotenv").config();
app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static('public'));

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.render('pages/searches/new.ejs')
})
app.get('/hello',(req,res) =>{
    res.render('pages')
})

app.get('/searches/new',(req,res) =>{
    console.log(req.query);
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})