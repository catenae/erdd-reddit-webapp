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

app.controller('StatsController', function ($scope, $filter, $interval, StatsService) {

	$scope.analyzedUsersSecond = 0;
	$scope.analyzedTextsSecond = 0;

	$scope.newUsersSecond = 0;
	$scope.newSubmissionsSecond = 0;
	$scope.newCommentsSecond = 0;

	$scope.users = 0;
	$scope.submissions = 0;
	$scope.comments = 0;

	var startTimestamp = new Date().getTime() / 1000;
	var currentMinute = new Date().getMinutes();

	var newUsers = 0;
	var newSubmissions = 0;
	var newComments = 0;

	$interval(function() {
		StatsService.getTotalUsers().success(function(data) {
		    var currentDate = new Date();
			var newMinute = currentDate.getMinutes();
			var currentTimestamp = currentDate.getTime() / 1000;
			var seconds = currentTimestamp - startTimestamp;
			
			if (newMinute == currentMinute) {
				if ($scope.users == 0) {
					$scope.users = data.count;
				}
				newUsers += data.count - $scope.users;
			} else {
				currentMinute = newMinute;
				startTimestamp = currentTimestamp;
				newUsers = data.count - $scope.users;
				newSubmissions = 0;
			    newComments = 0;
			}
			$scope.newUsersSecond = newUsers / seconds;
			$scope.newSubmissionsSecond = newSubmissions / seconds;
			$scope.newCommentsSecond = newComments / seconds;
			
			$scope.users = data.count;
		});
	}, 1000);

	$interval(function() {
		StatsService.getTotalSubmissions().success(function(data) {
		    var currentDate = new Date();
			var newMinute = currentDate.getMinutes();
			var currentTimestamp = currentDate.getTime() / 1000;
			var seconds = currentTimestamp - startTimestamp;

			if (newMinute == currentMinute) {
				if ($scope.submissions == 0) {
					$scope.submissions = data.count;
				}
				newSubmissions += data.count - $scope.submissions;
			} else {
				currentMinute = newMinute;
				startTimestamp = currentTimestamp;
				newUsers = 0;
				newSubmissions = data.count - $scope.submissions;
			    newComments = 0;
			}
			$scope.newUsersSecond = newUsers / seconds;
			$scope.newSubmissionsSecond = newSubmissions / seconds;
			$scope.newCommentsSecond = newComments / seconds;
			
			$scope.submissions = data.count;
		});
	}, 1000);

	$interval(function() {
		StatsService.getTotalComments().success(function(data) {
		    var currentDate = new Date();
			var newMinute = currentDate.getMinutes();
			var currentTimestamp = currentDate.getTime() / 1000;
			var seconds = currentTimestamp - startTimestamp;

			if (newMinute == currentMinute) {
				if ($scope.comments == 0) {
					$scope.comments = data.count;
				}
				newComments += data.count - $scope.comments;
			} else {
				currentMinute = newMinute;
				startTimestamp = currentTimestamp;
				newUsers = 0;
				newSubmissions = 0;
				newComments = data.count - $scope.comments;
		    }
			$scope.newUsersSecond = newUsers / seconds;
			$scope.newSubmissionsSecond = newSubmissions / seconds;
			$scope.newCommentsSecond = newComments / seconds;
			
			$scope.comments = data.count;
		});
	}, 1000);

	$interval(function() {
		StatsService.getRealTime().success(function(data) {
			$scope.analyzedUsersSecond = data.users_second;
			$scope.analyzedTextsSecond = data.texts_second;
		});
	}, 1000);

});
