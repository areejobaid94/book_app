const express = require('express');
const app = express();
var cors = require('cors')
require("dotenv").config();
app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
const superagent = require('superagent');

const port = process.env.PORT || 3000;

app.get('/searches/new', (req, res) => {
  res.render('pages/searches/new.ejs')
});

app.get('/hello',(req,res) =>{
    res.render('pages')
});

app.post('/searches',(req,res) =>{
    getDataFomeApi(req.body['search-que'],req.body['searching-by']).then(data =>{
       res.render('pages/searches/show',{data:data}); 
    });
});

function Book (obj){
    this.title =obj.volumeInfo.title;
    this.auther = obj.volumeInfo.authors ? obj.volumeInfo.authors.join(' & ') : 'Not Mentioned';
    this.url = obj.imageLinks ? obj.imageLinks.smallThumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
    this.description = obj.searchInfo.textSnippet;
};

function getDataFomeApi(q,searchingBy){
    const query = {
        q: `${q}+in${searchingBy}`,
        maxResults : 10
    }
    return superagent.get('https://www.googleapis.com/books/v1/volumes',query).then(data =>{
        return data.body.items.map(ele=>{
            return new Book(ele);
        });
    })
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})