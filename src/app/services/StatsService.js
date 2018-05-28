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

app.service('StatsService', function StatsService($http, urlBase) {
    return({
      getTotalUsers: getTotalUsers,
      getTotalSubmissions: getTotalSubmissions,
      getTotalComments: getTotalComments,
      getRealTime: getRealTime
	});

	function getTotalUsers(){
		return $http({
			method: 'GET',
            url: (urlBase + '/stats/total-users')
		});
	}

  function getTotalSubmissions(){
    return $http({
      method: 'GET',
            url: (urlBase + '/stats/total-submissions')
    });
  }

  function getTotalComments(){
    return $http({
      method: 'GET',
            url: (urlBase + '/stats/total-comments')
    });
  }

  function getRealTime(){
    return $http({
      method: 'GET',
            url: (urlBase + '/stats/real-time')
    });
  }

});
