const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const pgPromise = require('pg-promise')()   
const app = express()
app.use(bodyParser.urlencoded({extended: false}))
const connectionString = 'postgres://localhost:5430/mondaydb'
const db = pgPromise(connectionString);
const session = require('express-session')
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  }))
app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache')




app.get('/login', (req,res) => {
    res.render('login')
})

app.post('/login', (req,res) => {
    let username = req.body.username
    let password = req.body.password
    db.any('SELECT * FROM user_database WHERE username = $1 and password = $2;', [username,password])
    .then((data) => {
        if(data.length == 1){
            if(req.session){
                req.session.username = username
                req.session.userid = data[0].userid
                res.render('index', {messageLogin:`Welcome, ${username}!`})
            }
        }
        else(res.render('login', {messageLogin:"Wrong username/password. Try again :("}))
    })
})

app.post('/add-user', (req,res) => {
    let username = req.body.username
    let password = req.body.password
    if(username != "" && password != ""){
    db.none('INSERT INTO user_database (username, password) VALUES ($1, $2);', [username,password])
    .then(res.render('login',{message:"User has been added! Login above :)"}))}
    else{
        res.render('login', {message:"Make sure you enter a username and a password :)"})
    }
})

app.get('/index', (req, res) => {
    res.render('index')
})

app.post('/index', (req, res) => {
    let blogTitle = req.body.blogTitle
    let blogBody = req.body.blogBody
    let submitMessage = 'Blog has been entered! Click the button below to view all your blogs :)'
    if(req.session.userid != null){
        db.one('INSERT INTO monday_table (title,body,userid) VALUES ($1, $2, $3) RETURNING postid;', [blogTitle,blogBody,req.session.userid])
        .then(data => {
            res.render('index', {message: submitMessage})
        })    
    }
    else{
        res.render('index',{message: "Hmm, you aren't logged in. Login to add posts!"})
    }
})

app.post('/index/enter-comment', (req, res) => {
    let comment = req.body.comment
    let postid = req.body.postid
    let submitMessage = 'Comment has been entered :)'
    if(req.session.userid != null){
        db.none('INSERT INTO comment_database (comment,postid,userid,comment_username) VALUES ($1, $2, $3, $4);', [comment,postid,req.session.userid,req.session.username])
        .then(() => {
            res.render('index', {message: submitMessage})
        })    
    }
    else{
        res.render('index',{message: "Hmm, you aren't logged in. Login to add comments!"})
    }
})


app.post('/index/details', (req,res) => {
    let postid = req.body.postid
    db.any('SELECT * FROM monday_table JOIN user_database on monday_table.userid = user_database.userid LEFT JOIN \
    comment_database on monday_table.postid = comment_database.postid WHERE monday_table.postid = $1;', [postid])
    .then(posts => {
        console.log(posts)
        comments = []
        posts.forEach(row => {
            comments.push({username:row.comment_username, comment:row.comment})          
        });
        let detailPost = {
            posts:posts[0],
            comments:comments
        }
        res.render('details', {posts:detailPost})
    })
})

//adding a get to /index/view-all because it's going to be called every time an item is deleted....
app.get('/index/view-all', (req, res) => {
    db.any('SELECT * FROM monday_table JOIN user_database on (monday_table.userid = user_database.userid);')
    .then(posts => {
        res.render('index', {posts:posts})
    })
})

app.post('/index/view-all', (req, res) => {
    db.any('SELECT * FROM monday_table JOIN user_database on (monday_table.userid = user_database.userid);')
    .then(posts => {
        res.render('index', {posts:posts})
    })
})

app.post('/index/view-user-blogs', (req, res) => {
    db.any('SELECT * FROM monday_table JOIN user_database on (monday_table.userid = user_database.userid) \
    WHERE monday_table.userid = $1;', [req.session.userid])
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

app.post('/logout', (req,res) => {
    req.session.username = null
    req.session.userid = null
    res.redirect('/login')
})

app.listen(3000, () => {
    console.log('server is running...')
})
