var gulp = require('gulp');
var concat = require('gulp-concat');
var header = require('gulp-header');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var nodemon = require('gulp-nodemon');
var stylus = require('gulp-stylus');
var uglify = require('gulp-uglify');
var package = require('./package.json');
var PORT = 2500;


// Banner using meta data from package.json
var banner = [
  '/*!\n' +
  ' * <%= package.name %>\n' +
  ' * <%= package.description %>\n' +
  ' * <%= package.url %>\n' +
  ' * @author <%= package.author %>\n' +
  ' * @version <%= package.version %>\n' +
  ' * Copyright ' + new Date().getFullYear() + '. <%= package.license %> licensed.\n' +
  ' */',
  '\n'
].join('');


// Project paths
var paths = {
  src: {
    css: './public/style/',
    js: './public/js/',
    html: './views/',
  },
  dist: {
    css: './public/style/',
    js: './public/js/dist/',
    html: './views/'
  }
};


// Minify and concat css
gulp.task('stylus', function() {
  gulp.src(paths.src.css + 'master.styl')
    .on('error', function(err) {
      console.log(err.message);
    })
    .pipe(stylus({
      compress: true
    }))
    .pipe(header(banner, {
      package: package
    }))
    .pipe(concat('master.min.css'))
    .pipe(gulp.dest(paths.dist.css))
    .pipe(reload({
      stream: true,
    }));
});


// Concatinate and minify Javascript
gulp.task('js', function() {
  gulp.src([
    paths.src.js + 'main.js'
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(header(banner, {
      package: package
    }))
    .pipe(gulp.dest(paths.dist.js))
    .pipe(reload({
      stream: true,
    }));
});


gulp.task('browser-sync', ['nodemon'], function() {
  browserSync.init(null, {
    proxy: 'localhost:' + PORT,
    notify: false
  });
});

// Browser sync reload
gulp.task('bs-reload', function() {
  browserSync.reload();
});

gulp.task('default', ['stylus', 'js', 'browser-sync'], function () {
  gulp.watch([paths.src.css + '*.styl'], ['stylus', 'bs-reload']);
  gulp.watch([paths.src.js + '*.js'], ['js', 'bs-reload']);
  gulp.watch([paths.src.html + '*.html'], ['bs-reload']);
});

gulp.task('nodemon', function (cb) {
  var called = false;
  return nodemon({script: 'server.js'}).on('start', function () {
    if (!called) {
      called = true;
      cb();
    }
  });
});
