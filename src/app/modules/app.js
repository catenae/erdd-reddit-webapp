/*
    A Micromodule Approach for Building Real-Time Systems with Python-based
    Models: Application to Early Risk Detection of Depression on Social Media

    Copyright (C) 2017-2018 Rodrigo Martínez-Castaño (brunneis) <dev@brunneis.com>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var app = angular.module("catenae", ['ngRoute', 'chart.js', 'nvd3ChartDirectives']);

app.constant('urlBase', 'http://catenae.brunneis.com:8080/api/v1.0');

app.filter('sentences', function() {
  return function(value) {
    return (!value) ? '' : value.replace(/[\.?!]+\s/g, '.\n\n').trim();
  };
});

app.filter('initial', function() {
  return function(value) {
    var counter = 0;
    var initial;
    const avoidedChars = ['_', '-'];
    while (avoidedChars.indexOf(initial = value[counter].toUpperCase()) != -1) {
      counter++;
    }
    return initial;
  };
});

app.filter('duration', function() {
  return function(value) {
    // If millis precision, reduce to seconds
    const currentTimestampSecondsLength = String(new Date().getTime()).length;

    if (String(value).length == currentTimestampSecondsLength - 3) {
      value *= 1000;
    } else if (String(value).length != currentTimestampSecondsLength) {
      return '';
    }

    minutes = Math.floor((+new Date() - (value))/60000);
    var result;

    if (minutes < 60) {
      result = minutes + ' minute';
      if (minutes > 1) result += 's';
    }

    else if (minutes < 1440) {
      var hours = Math.floor(minutes/60);
      result = hours + ' hour';
      if (hours > 1) result += 's';
    }

    else if (minutes < 525600) {
      var days = Math.floor(minutes/1440);
      result = days + ' day';
      if (days > 1) result += 's';
    }

    else {
      var years = Math.floor(minutes/525600);
      result = years + ' year';
      if (years > 1) result += 's';
    }

    if (minutes == 0 || minutes < 0) {
      result = 'Just now';
    } else {
      result += ' ago';
    }

    return result;
  };
});

app.filter('cut', function() {
  return function(value, wordwise, max, tail) {
    if (!value) return '';

    max = parseInt(max, 10);
    if (!max) return value;
    if (value.length <= max) return value;

    value = value.substr(0, max);
    if (wordwise) {
      var lastspace = value.lastIndexOf(' ');
      if (lastspace !== -1) {
        //Also remove . and , so its gives a cleaner result.
        if (value.charAt(lastspace - 1) === '.' || value.charAt(lastspace - 1) === ',') {
          lastspace = lastspace - 1;
        }
        value = value.substr(0, lastspace);
      }
    }

    return value + (tail || ' …');
  };
});

app.config(function($routeProvider, $locationProvider, $httpProvider) {

  $routeProvider.when('/alerts', {
    templateUrl: 'app/views/AlertsView.html',
    controller: 'AlertsController',

  }).when('/users', {
    templateUrl: 'app/views/UsersView.html',
    controller: 'UsersController',

  }).when('/datasets', {
    templateUrl: 'app/views/DatasetsView.html',
    controller: 'DatasetsController',

  }).when('/stats', {
    templateUrl: 'app/views/StatsView.html',
    controller: 'StatsController',

  }).otherwise({
    redirectTo: function() {
      window.location.href = '/alerts';
    }
  });

  // use the HTML5 History API
  $locationProvider.html5Mode(true);

}).run(['$rootScope', '$location', function($rootScope, $location) {
  var path = function() {
    return $location.path();
  };
  $rootScope.$watch(path, function(newVal, oldVal) {
    $rootScope.activetab = newVal;
  });
}]);
