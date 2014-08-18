var got = require('got'),
    cheerio = require('cheerio'),
    nunjucks = require('nunjucks'),
    express = require('express'),
    stylus = require('stylus'),
    bodyParser = require('body-parser'),
    app = express(),
    port = parseInt(process.env.PORT, 10) || 4000;

function scrapeImdb(cb) {  
  got('http://www.imdb.com/chart/top', function (err, data) {

    if (err) {
      return cb(err);
    }

    var ret = [];
    var $ = cheerio.load(data);

    $('td.titleColumn > a').each(function(i, el) {
      var href = /\/(.+)\//.exec(el.attribs.href)[0].split('/')[2];
      ret.push(href);
    });    
    
    if (ret.length === 0) {
      return cb( new Error('Could not find any movie titles') );
    }

    cb(ret);
  });
}

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

app.use(bodyParser.json());
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(__dirname + '/public'));  

app.use(function( req, res, next ) {
  res.type('application/json');
  next();
});

app.get("/", function (req, res) {
  res.type('text/html');
  res.render('index.html', {
    name: "Denotes",
    title: "IMDb's Top 250 Movies"
  });
});

app.get("/imdb", function (req, res) {
  scrapeImdb(function (ret) {
    res.send(ret);
  });
});

console.log("Simple static server listening at http://localhost:" + port);
app.listen(port);
