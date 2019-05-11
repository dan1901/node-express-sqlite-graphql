const createError = require('http-errors');
const express = require('express');
const path = require('path');
const graphqlHTTP = require('express-graphql');
const {buildSchema} = require('graphql');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const bodyParserGQL = require('body-parser-graphql');
const indexRouter = require('./routes/index');
const DB = require('better-sqlite3-helper');

DB({
    path: 'data',
    memory: false,
    readonly: false,
    fileMustExist: false,
    WAL: true,
})
const app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParserGQL.graphql());

app.use('/', indexRouter);


const schema = buildSchema(`
  type Query {
    users: [User]
    user(id:Int):[User]
    posts: [Post]
    post(id:Int): [Post]
    comments: [Comment]
    comment(id:Int): [Comment]
  }
  type User {
    id: Int
    name: String
    create_date: String
  }
  type Post {
    id: Int
    title: String
    text: String
    author: Int
    create_date: String
  }
  type Comment {
    id: Int
    post: Int
    user: Int
    text: String
    create_date: String
   }
`);

const root = {
    users: () => {
        const users = DB().query('SELECT * FROM User');
        return users
    },
    user: (args, context, info) => {
        const {id} = args
        const user = DB().query('SELECT * FROM User where id=?',id);
        return user
    },
    posts: ()=>{
        const posts = DB().query('select * from Post');
        return posts
    },
    post: (args, context, info)=>{
        const {id} = args
        const post = DB().query('select * from Post where id=?',id);
        return post
    },
    comments: ()=>{
        const comments = DB().query('select * from Comment');
        return comments
    },
    comment: (args, context, info)=>{
        const {id} = args
        const comment = DB().query('select * from Comment where id=?',id);
        return comment
    }

};
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
