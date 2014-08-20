var async   = require('async'),
    cheerio = require('cheerio'),
    debug   = require('util').debug,
    fs      = require('fs'),
    got     = require('got'),
    timers  = require('timers');

module.exports = function(localPath, updateInterval) {
  var self = this;

  self.movies = fs.existsSync(localPath) ? require(localPath) : {};

  var fetchIds = function(done) {
    debug('fetching movie ids...');
    got('http://www.imdb.com/chart/top', function (err, data) {
      if (err) return done(err);

      var ids = [];
      var $ = cheerio.load(data);

      $('td.titleColumn > a').each(function(i, el) {
        ids.push(/\/(.+)\//.exec(el.attribs.href)[0].split('/')[2]);
      });

      debug('got ' + ids.length + ' ids');

      done(null, ids);
    });
  }

  var fetchMovies = function(ids, done) {
    debug('fetching movies...');

    var fetchers = {};

    ids.forEach(function(id) {
      fetchers[id] = function(cb) { got('http://www.omdbapi.com/?i=' + id, function(err, data) {
        cb(err, data);
      })};
    });

    async.parallel(fetchers, function(err, data) {
      if (err) return done(err);

      var movies = {};
      var useless = [];
      for (var k in data) {
        var movie = JSON.parse(data[k]);
        for (var u in useless) delete movie[u];
        movies[k] = movie;
      }

      done(null, movies)
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
