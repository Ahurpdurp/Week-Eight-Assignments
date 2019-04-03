const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const app = express()
app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache')
app.use(bodyParser.urlencoded({extended: false}))
const models = require('./models')

app.get('/index', (req,res) => {
    res.render('index')
})

app.post('/index/add-item', (req,res) => {
    let title = req.body.title
    let body = req.body.body
    let category = req.body.category 
    models.Posts.build({
        title: title,
        body: body, 
        category: category
    })
    .save()
    .then(x => {
        res.render('index', {Message: 'Blog was added!'})
    })
    .catch(x => {
        res.render('index', {Message:'Hmm, the blog wasn\'t added. Try again.'})
    })
})

app.get('/index/view-all', (req,res) => {
    models.Posts.findAll({raw: true}).then((posts) => {
        res.render('index',{posts:posts})
      })
})

app.post('/index/view-all', (req,res) => {
    models.Posts.findAll({raw: true}).then((posts) => {
        res.render('index',{posts:posts})
      })
})

app.post('/index/delete-post', (req,res) => {
    let postId = req.body.id
    models.Posts.destroy({
        where: {
            id: postId
        }
    })
    res.redirect('/index/view-all')
})

app.post('/index/update-post', (req,res) => {
    let postId = req.body.id
    models.Posts.findAll({
        where: {
            id: postId
        },
        raw: true
        }).then((posts) => {
        res.render('update',{posts:posts})
      })
})

app.post('/index/update-post-final', (req, res) => {
    let postId = req.body.id
    let title = req.body.title
    let body = req.body.body
    models.Posts.update(
        {title:title, body:body},
        {where:{id:postId}}
    )
    res.redirect('/index')
})

app.post('/index/filter', (req,res) => {
    let categoryFilter = req.body.categoryFilter
    models.Posts.findAll(
        {
            where: {category:categoryFilter}
        },
        {raw: true}).then((posts) => {
        res.render('index',{posts:posts})
      })
})

app.listen(3000, () => {
    console.log('server running...')
})