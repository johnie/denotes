var got = require('got'),
    cheerio = require('cheerio'),
    nunjucks = require('nunjucks'),
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    MovieDb = require('./movie_db'),
    port = parseInt(process.env.PORT, 10) || 4000;

nunjucks.configure('views', {
  autoescape: true,
  express: app,
  tags: {
    blockStart: '<%',
    blockEnd: '%>',
    variableStart: '<$',
    variableEnd: '$>',
    commentStart: '<#',
    commentEnd: '#>'
  }
});

var db = new MovieDb("./movies.json", 36000);

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.use(function( req, res, next ) {
  res.type('application/json');
  next();
});

app.get("/", function (req, res) {
  res.type('text/html');
  res.render('index.html', {
    name: "Denotes",
    title: "Encouraging you to watch the worlds 250 best movies",
    author: "Johnie Hjelm"
  });
});

app.get("/imdb", function (req, res) {
  res.send(Object.keys(db.movies));
});

app.get("/imdb/all", function (req, res) {
  res.send(db.movies);
});


app.get("/imdb/:movieId", function (req, res) {
  res.send(db.movies[req.params.movieId]);
});

console.log("Denotes listening at http://localhost:" + port);
app.listen(port);
