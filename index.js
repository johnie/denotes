var got = require('got'),
    cheerio = require('cheerio'),
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express()
    port = parseInt(process.env.PORT, 10) || 4000;

function scrapeImdb(cb) {  
  got('http://www.imdb.com/chart/top', function (err, data) {

    if (err) {
      return err;
    }

    var ret = [];
    var $ = cheerio.load(data);

    $('td.titleColumn > a').each(function(i, el) {
      var href = /\/(.+)\//.exec(el.attribs.href)[0].split('/')[2];
      ret.push(href);
    });    
    
    if (ret.length === 0) {
      return new Error('Could not find any movie titles');
    }

    cb(ret);

  });
}

var imdb = scrapeImdb(function (ret) { JSON.stringify(ret); });

app.use(bodyParser.json());

app.use(function( req, res, next ) {
  res.type('application/json');
  next();
});

app.get("/", function (req, res) {
  res.type('text/html');
  res.sendFile(__dirname + '/index.html');
});

app.get("/imdb", function (req, res) {
  res.send(imdb);
});

console.log("Simple static server listening at http://localhost:" + port);
app.listen(port);
