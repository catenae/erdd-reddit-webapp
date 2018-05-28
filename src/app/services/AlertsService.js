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

app.service('AlertsService', function AlertsService($http, urlBase) {
  return ({
    getAlerts: getAlerts,
    getPosts: getPosts,
    tagAlert: tagAlert,
    unlistAlert: unlistAlert
  });

  function tagAlert(alert_id, tag) {
    var url = urlBase + '/alerts/' + alert_id;

    return $http({
      method: 'PUT',
      data: { 'tag': tag },
      headers: { 'Content-Type': 'application/json' },
      url: (url)
    });
  }

  function getAlerts(count=5, min_threshold, max_threshold, tag, sort, skip, page) {
    var url = urlBase + '/alerts?count=' + count;

    if (min_threshold != undefined && min_threshold != 0) {
      url += '&min_threshold=' + min_threshold;
    }

    if (max_threshold != undefined && max_threshold != 1) {
      url += '&max_threshold=' + max_threshold;
    }

    const VALID_TAGS = ['undecided', 'risk', 'riskfree'];
    if (tag != undefined && VALID_TAGS.indexOf(tag) != -1) {
      url += '&tag=' + tag;
    }

    const VALID_SORTS = ['proba', 'timestamp'];
    if (sort != undefined && VALID_SORTS.indexOf(sort) != -1) {
      url += '&sort=' + sort;
    }

    if (skip != undefined && skip > 0) {
      url += '&skip=' + skip;
      // Page == 0 by default
    } else if (page != undefined && page > 0) {
      url += '&page=' + page;
    }

    console.log(url)

    return $http({
      method: 'GET',
      url: (url)
    });
  }

  function unlistAlert(alert) {
    var url = urlBase + '/alerts/' + alert;

    return $http({
      method: 'DELETE',
      url: (url)
    });
  }

  function getPosts(entity, user, last_id, count=5, page=0, max_threshold) {
    var url = urlBase + '/' + entity + '/' + user
      + '?count=' + count
      + '&page=' + page;

    if (last_id != undefined) {
      url += '&last_id=' + last_id;
    }

    if (max_threshold != undefined) {
      url += '&max_threshold=' + max_threshold;
    }

    // console.log(url)

    return $http({
      method: 'GET',
      url: (url)
    });
  }

});
