var app = angular.module("denotes", []);

app.controller('MainController', function ($scope, $http) {

  $scope.movies = [];

  $http({
    method: 'GET', 
    url: '/imdb'
  }).success(function (data) {
    angular.forEach(data, function (value, key) {
      $.getJSON("http://www.omdbapi.com/?i=" + value, function (item) {
        $scope.movies.push({
          title: item.Title,
          imdbRating: item.imdbRating,
          done: false
        });
        $scope.$digest();
      });
    });
  });
});
