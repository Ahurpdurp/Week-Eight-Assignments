const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const pgPromise = require('pg-promise')()   
const app = express()
app.use(bodyParser.urlencoded({extended: false}))
const connectionString = 'postgres://localhost:5430/mondaydb'
const db = pgPromise(connectionString);
app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache')
console.log(db)


app.get('/index', (req, res) => {
    res.render('index')
})



app.post('/index', (req, res) => {
    let blogTitle = req.body.blogTitle
    let blogBody = req.body.blogBody
    let submitMessage = 'Blog has been entered! Click the button below to view all your blogs :)'
    db.one('INSERT INTO monday_table (title,body) VALUES ($1, $2) RETURNING postid;', [blogTitle,blogBody])
    .then(data => {
        res.render('index', {message: submitMessage})
    })
})

//adding a get to /index/view-all because it's going to be called every time an item is deleted....
app.get('/index/view-all', (req, res) => {
    db.any('SELECT * FROM monday_table;')
    .then(posts => {
        res.render('index', {posts:posts})
    })
})

app.post('/index/view-all', (req, res) => {
    db.any('SELECT * FROM monday_table;')
    .then(posts => {
        res.render('index', {posts:posts})
    })
})


app.post('/index/delete-post', (req,res) => {
    let postId = req.body.postid
    db.none('DELETE FROM monday_table WHERE postid = $1;', [postId])
    .then(() => {
        console.log('Blog has been deleted!')
        res.redirect('/index/view-all')
    })
})

app.post('/index/update-post', (req,res) => {
    let postId = req.body.postid
    db.one('SELECT * FROM monday_table WHERE postid = $1;', [postId])
    .then(post => {
        res.render('update', {post:post})
    })
})

app.post('/index/update-post-final', (req,res) => {
    let postId = req.body.postid
    let blogTitle = req.body.blogTitle
    let blogBody = req.body.blogBody
    db.none('UPDATE monday_table SET title = $1, body = $2 WHERE postid = $3;', [blogTitle, blogBody, postId])
    .then(() => {
        console.log('it\'s been updated!')
        res.redirect('/index')
    }) 
})

app.listen(3000, () => {
    console.log('server is running...')
})
