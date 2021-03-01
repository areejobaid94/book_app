const express = require('express');
const app = express();
var cors = require('cors')
require("dotenv").config();
app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
const superagent = require('superagent');
const pg = require('pg');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

const port = process.env.PORT || 3000;


app.get('/searches/new', (req, res) => {
    res.render('pages/searches/new.ejs')
});

app.get('/', getSavedData);

app.get('/books/:id', viewDelails);

app.get('/hello', (req, res) => {
    res.send('Hello');
});

app.get('*', (req, res) => {
    res.status(404).render('pages/error', { error: '404 Error' });
});

app.post('/searches', (req, res) => {
    try {
        getDataFomeApi(req.body['search-que'], req.body['searching-by']).then(data => {
            res.render('pages/searches/show', { data: data });
        });
    } catch (error) {
        res.render('pages/error', { error: error });
    }
});

app.post('/books',saveToDB);

function Book(obj) {
    this.title = obj.volumeInfo.title;
    this.author = obj.volumeInfo.authors ? obj.volumeInfo.authors.join(' & ') : 'Not Mentioned';
    this.image_url = obj.volumeInfo.imageLinks ? obj.volumeInfo.imageLinks.smallThumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
    this.description = obj.searchInfo.textSnippet;
};

function getDataFomeApi(q, searchingBy) {
    const query = {
        q: `${q}+in${searchingBy}`,
        maxResults: 10
    }

    return superagent.get('https://www.googleapis.com/books/v1/volumes', query).then(data => {
        return data.body.items.map(ele => {
            return new Book(ele);
        });
    }).catch(error => {
        res.render('pages/error', { error: error });
    })
}

function getSavedData(req,res){
    return getFormDB().then(data=>{
        res.render('pages',{data:data,isVis: 'visible',isVisDis:'hidden'})
    }).catch(error => {
        res.render('pages/error', { error: error });
    })
};

function getFormDB(id){
    let query = id ?  `SELECT * FROM favbook WHERE id = ${id}`:'SELECT * FROM favbook';
    return client.query(query).then(data=>{
        return data.rows;
    }).catch(error => {
        res.render('pages/error', { error: error });
    })
}

function viewDelails(req, res){
    return getFormDB(req.params.id).then(data=>{
        console.log(data);
        res.render('pages/books/show',{data:data,isVis:'hidden',isVisDis:'visible'})
    }).catch(error => {
        res.render('pages/error', { error: error });
    });
};

function saveToDB(req,res){
    let insertQuery = 'INSERT INTO  favbook(title,author,image_url,description)  VALUES ($1,$2,$3,$4) RETURNING id;'
    client.query(insertQuery,[req.body.title,req.body.author,req.body['image_url'],req.body.description]).then(data=>{
        res.redirect(`/books/${data.rows[0].id}`);
    }).catch(e => {
        res.render('pages/error', { error: error });
    })
}

client.connect().then(() => {
    app.listen(port, () => {
        console.log(`app listening at http://localhost:${port}`);
    });
}).catch(e => {
    console.log(e, 'errrrrroooooorrrr')
})