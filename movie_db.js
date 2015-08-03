var async   = require('async');
var cheerio = require('cheerio');
var fs      = require('fs');
var got     = require('got');
var timers  = require('timers');

module.exports = function(localPath, updateInterval) {
  var self = this;

  self.movies = fs.existsSync(localPath) ? require(localPath) : {};

  var fetchIds = function(done) {
    console.log('fetching movie ids...');
    got('http://www.imdb.com/chart/top', {
        headers: {
          'user-agent': 'https://github.com/johnie/denotes'
        }
      }, function (err, data) {
      if (err) return done(err);

      var ids = [];
      var $ = cheerio.load(data);

      $('td.titleColumn > a').each(function(i, el) {
        ids.push(/\/(.+)\//.exec(el.attribs.href)[0].split('/')[2]);
      });

      console.log('got ' + ids.length + ' ids');

      done(null, ids);
    });
  }

  var fetchMovies = function(ids, done) {
    console.log('fetching movies...');

    var fetchers = {};

    ids.forEach(function(id) {
      fetchers[id] = function(cb) { got('http://www.omdbapi.com/?i=' + id, function(err, data) {
        cb(err, data);
      })};
    });

    async.parallel(fetchers, function(err, data) {
      if (err) return done(err);

      var movies = {};
      var useless = [
        "Language",
        "Country",
        "Metascore",
        "Type",
        "Response"
      ];
      for (var k in data) {
        var movie = JSON.parse(data[k]);
        for (var u in useless) delete movie[useless[u]];
        movies[k] = movie;
      }

      done(null, movies);
    });
  }

  var update = function(done) {
    async.waterfall([fetchIds, fetchMovies], function(err, movies) {
      if (err) return console.log('failed to update movies: ' + err);

      self.movies = movies;
      fs.writeFile(localPath, JSON.stringify(movies, null, 2), function(err) {
        if (err) console.log('failed to save movie data: ' + err);
        else console.log('movie data saved');

        if (typeof done !== 'undefined' && done) done(err);
      });
    });
  };

  update(function(err) {
    if (typeof updateInterval !== 'undefined' && updateInterval) {
      timers.setInterval(update, updateInterval * 1000);
    }
  });
};
