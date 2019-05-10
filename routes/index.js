const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data');
const moment = require('moment');
console.log(moment().format('YYYY-MM-DD h:m:s'))
/* GET users listing. */
router.get('/users', function (req, res, next) {
    const startPos =req.query.startPos ? req.query.startPos : 0;
    const pageCount =req.query.pageCount ? req.query.pageCount : 10;
    db.all("SELECT * FROM User limit ?, ?",
        [startPos, pageCount],
        function (err, row) {
            if (err) res.json(err);
            res.json(row);
    })
}).post('/users', function (req, res, next) {
    const now = moment().format('YYYY-MM-DD HH:mm:ss')
    db.run("INSERT INTO User(name, create_date, update_date) Values(?,?,?)",
        [req.body.name, now, now],
        function (err) {
            if (err) res.json(err)
            res.json(`A row has been inserted with rowid ${this.lastID}`)
    })
}).get('/users/:id', function (req, res, next) {
    db.get("select * from User where id = ?",
        [req.params.id],
        function (err, row) {
            if (err) res.json(err)
            res.json(row)
    })
});

router.get('/users/:id/posts', function (req, res, next) {
    const startPos =req.query.startPos ? req.query.startPos : 0;
    const pageCount =req.query.pageCount ? req.query.pageCount : 10;
    db.all("SELECT * FROM Post where author=? limit ?,?",
        [req.params.id, startPos, pageCount],
        function (err, row) {
            if (err) res.json(err);
            res.json(row);
    })
}).get('/users/:id/posts/:postId', function (req, res, next) {
    db.get("select * from Post where id = ? and author = ?",
        [req.params.postId, req.params.id],
        function (err, row) {
            if (err) res.json(err);
            res.json(row)
    })
}).put('/users/:id/posts/:postId', function (req, res, next) {
    const now = moment().format('YYYY-MM-DD HH:mm:ss')
    db.run("update Post set title= ?, text = ?, update_date = ? where id= ? and author=?",
        [req.body.title, req.body.text, now, req.params.postId, req.params.id],
        function (err, row) {
            if (err) res.json(err);
            res.json(`Row(s) updated: ${this.changes}`)
    })
}).delete('/users/:id/posts/:postId', function (req, res, next) {
    db.run("delete from Post where id= ? and author= ?",
        [req.params.postId, req.params.id],
        function (err, row) {
            if (err) res.json(err);
            res.json(`Row(s) delete: ${this.changes}`)
    })
}).post('/users/:id/posts', function (req, res, next) {
    const now = moment().format('YYYY-MM-DD HH:mm:ss')
    db.run("INSERT INTO Post(author,title, text, create_date, update_date) Values(?,?,?,?,?)",
        [req.params.id, req.body.title, req.body.title, now, now],
        function (err) {
            if (err) res.json(err);
            res.json(`A row has been inserted with rowid ${this.lastID}`)
    })
});

router.get('/users/:id/comments', function (req, res, next) {
    const startPos =req.query.startPos ? req.query.startPos : 0;
    const pageCount =req.query.pageCount ? req.query.pageCount : 10;
    db.all("select * from Comment where Comment.user = ? limit ?,?",
        [req.params.id, startPos, pageCount],
        function (err, row) {
            if (err) res.json(err);
            res.json(row);
    })
}).get('/users/:id/comments/:commentId', function (req, res, next) {
    db.get("select * from Comment where Comment.user = ? and id = ?",
        [req.params.id, req.params.commentId],
        function (err, row) {
            if (err) res.json(err);
            res.json(row);
    })
}).post('/users/:id/posts/:postId/comments', function (req, res, next) {
    const now = moment().format('YYYY-MM-DD HH:mm:ss')
    db.run(
        "INSERT INTO Comment(post,user, text, create_date, update_date) Values(?,?,?,?,?)",
        [req.params.postId,req.params.id, req.body.text, now, now],
        function (err) {
            if (err) res.json(err);
            res.json(`A row has been inserted with rowid ${this.lastID}`)
    })
}).put('/users/:id/posts/:postId/comments/:commentsId', function (req, res, next) {
    const now = moment().format('YYYY-MM-DD HH:mm:ss')
    db.run("update Comment set text = ?, update_date = ? where id= ??",
        [ req.body.text, now, req.params.commentId],
        function (err, row) {
            if (err) res.json(err);
            res.json(`Row(s) updated: ${this.changes}`)
    })
}).delete('/users/:id/posts/:postId/comments/:commentId', function (req, res, next) {
    db.run("delete from Comment where id= ? ",
        [req.params.commentId],
        function (err, row) {
            if (err) res.json(err);
            res.json(`Row(s) delete: ${this.changes}`)
    })
});

router.get('/posts/:postId/comments',function (req, res, next) {
    const startPos =req.query.startPos ? req.query.startPos : 0;
    const pageCount =req.query.pageCount ? req.query.pageCount : 10;
    db.all("select * from Comment where post = ? limit ?,?",
        [req.params.postId,startPos,pageCount],
        function (err, row) {
            if (err) res.json(err);
            res.json(row);
    })
}).get('/posts/:postId/comments/:commentId', function (req, res, next) {
    db.get("select * from Comment where post= ? and id = ?",
        [req.params.postId, req.params.commentId],
        function (err, row) {
            if (err) res.json(err);
            res.json(row);
        })
});
module.exports = router;
