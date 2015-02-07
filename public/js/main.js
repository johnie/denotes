var app = angular.module("denotes", ['angular-loading-bar']);

app.controller('MainController', function ($scope, $http, cfpLoadingBar) {
  cfpLoadingBar.start();
  $scope.movies = [];
  $scope.limit = 0;
  $scope.loadMore = function () {
    $scope.limit += 50;
  };
  $scope.loadMore();
  $scope.show = "All";

  $http({
    method: 'GET',
    url: '/imdb'
  }).success(function (data) {
    angular.forEach(data, function (value, key) {
      cfpLoadingBar.complete();
      $.getJSON("/imdb/" + value, function (item) {
        var poster = item.Poster.split('_V1_SX300.jpg'),
            smallPoster = poster[0] + "_V1_SX180_AL_.jpg";
        $scope.movies.push({
          title: item.Title,
          genre: item.Genre,
          runtime: item.Runtime,
          director: item.Director,
          plot: item.Plot,
          post: smallPoster,
          imdbRating: item.imdbRating,
          done: false
        });
        $scope.$digest();
      });
    });
  }).error(function (data, status) {
    console.log(status);
    cfpLoadingBar.complete();
  });

  /* Filter Function for All | Incomplete | Complete */
  $scope.showFn = function  (todo) {
    if ($scope.show === "All") {
      return true;
    }else if(todo.done && $scope.show === "Complete"){
      return true;
    }else if(!todo.done && $scope.show === "Incomplete"){
      return true;
    }else{
      return false;
    }
  };
});

app.directive("directiveWhenScrolled", function() {
  return function(scope, elm, attr) {
    var raw = elm[0];

    $(window).bind('scroll', function() {
      if($(window).scrollTop() + $(window).height() === $(document).height()) {
        scope.$apply(attr.directiveWhenScrolled);
      }
    });
  };
});

app.directive("moviePopover", function () {
  return {
    restrict: 'E',
    template: '<aside class="movies__popover" ng-class="{active: popover}"><h3 class="popover__title">{{ movie.title }} <span class="popover__runtime">{{ movie.runtime }}</span></h3><p class="popover__genre">{{ movie.genre }}</p><p class="popover__plot">{{ movie.plot}} </p><p class="popover__director"><strong>Director: </strong>{{ movie.director }}</p></aside>'
  }
});

app.filter('truncate', function () {
  return function (text, length, end) {
    if (isNaN(length))
      length = 25;

    if (end === undefined)
    end = "…";

    if (text.length <= length || text.length - end.length <= length) {
      return text;
    } else {
      return String(text).substring(0, length-end.length) + end;
    }
  };
});
