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

app.controller('AlertsController', function($scope, $filter, $interval, AlertsService) {
  $scope.loadLock = false;
  $scope.alertFilter = 'undecided';
  $scope.avatarColors = {};
  $scope.subredditColors = {};
  var colors = ['E91E63', '9C27B0', '673AB7', '3F51B5', '2196F3',
    '00BCD4', '009688', '4CAF50', 'CDDC39', '795548'
  ];

  $scope.sortBy = "timestamp";

  var prevHighestAlertFilter;
  var prevLowestAlertFilter;

  var alertBatchSize = 5;
  var postsBatchSize = 5;

  var newerAlertsByUser = {};
  $scope.showOnlyLastAlert = true;


  $scope.checkVisibility = function(alert) {
    // The array can also be accessed as a hashmap
    if (alert.hidden) {
      return false;
    }

    // If the showOnlyLastAlert flag is not active, show the alert
    if (!$scope.showOnlyLastAlert) {
      return true;
    }

    // If the flag is active, show the alert only if it is the last user's alert
    if (newerAlertsByUser[alert.user] == alert.timestamp) {
      return true;
    }
    return false;
  }

  $scope.switchAlertOrder = function() {
    if ($scope.sortBy == 'proba') {
      $scope.sortBy = 'timestamp';
    } else if ($scope.sortBy == 'timestamp') {
      $scope.sortBy = 'proba';
    }
    initData();
  }

  $scope.yFunction = function() {
    return function(d) {
      if (d == undefined) return 0;
      return d[1];
    };
  }

  $scope.xFunction = function() {
    return function(d) {
      if (d == undefined) return 0;
      return d[0];
    };
  }

  $scope.colorFunction = function() {
    return function(d, i) {
      return '#448aff'
    };
  }

  $scope.changeAlertFilter = function(filter) {
    $scope.alertFilter = filter;
    initData();
  }

  $scope.downloadFullDataset = function(timestamp) {}

  $scope.hideAlert = function(alert) {
    alert.hidden = true
    M.toast({
      html: "The alert was hidden"
    });
  }

  $scope.unlistAlert = function(alert) {
    alert.hidden = true
    AlertsService.unlistAlert(alert.id)
      .success(function(data) {
        M.toast({
          html: "The alert was unlisted"
        });
      });
  }

  $scope.getPrettyTag = function(tag) {
    if (tag == 'undecided') {
      return 'Undecided';
    } else if (tag == 'risk') {
      return 'Risk';
    } else if (tag == 'riskfree') {
      return 'Risk free';
    }
  }

  $scope.updateAlertTag = function(alert, tag) {
    tagAlert(alert);
    alert.prettyTag = $scope.getPrettyTag(tag);
    alert.tag = tag;
  }


  getMatrixFromRiskVector = function(risk_vector) {
    if (risk_vector.length == 1) {
      return [
        [0, risk_vector[0]],
        [1, risk_vector[0]]
      ];
    }

    var matrix = [];
    for (var i = 0; i < risk_vector.length; i++) {
      matrix.push([i, risk_vector[i]]);
    }
    return matrix;
  }


  $scope.loadAlerts = function(lowerAlerts = false) {
    if ($scope.sortBy == 'proba') {
      var min_threshold = 0;
      var max_threshold = 1;
    } else if ($scope.sortBy == 'timestamp') {
      var min_threshold = 0;
    }

    var currentBatchSize = alertBatchSize;
    var skip = prevLowestAlertFilter[1];

    if ($scope.alerts.length > 0 && prevLowestAlertFilter[0] != -1) {
      // LOWER ALERTS
      if (lowerAlerts) {
        max_threshold = prevLowestAlertFilter[0];
      // HIGHER ALERTS
      } else {
        min_threshold = prevLowestAlertFilter[0];
      }
    }

    // HIGHER ALERTS
    if (!lowerAlerts) {
      currentBatchSize += $scope.alerts.length;
    }

    AlertsService.getAlerts(currentBatchSize,
        min_threshold,
        max_threshold,
        $scope.alertFilter,
        $scope.sortBy,
        skip)
      .success(function(data) {

        var newAlertsFlag = false
        for (var i = 0; i < data.length; i++) {

          // If the alert is new
          if ($scope.alertIds.indexOf(data[i].id) == -1) {
            console.log(data[i].timestamp)

            // Timestamp filter
            if ($scope.sortBy == "timestamp") {

              if (data[i].timestamp < prevLowestAlertFilter[0] || prevLowestAlertFilter[0] == -1) {
                prevLowestAlertFilter = {
                  0: data[i].timestamp,
                  1: 1
                };
              } else if (data[i].timestamp == prevLowestAlertFilter[0]) {
                prevLowestAlertFilter[1] = prevLowestAlertFilter[1] + 1;
              }

              if (data[i].timestamp > prevHighestAlertFilter[0] || prevHighestAlertFilter[0] == -1) {
                prevHighestAlertFilter = {
                  0: data[i].timestamp,
                  1: 1
                };
              } else if (data[i].timestamp == prevHighestAlertFilter[0]) {
                prevHighestAlertFilter[1] = prevHighestAlertFilter[1] + 1;
              }

            }

            // Probability filter
            else if ($scope.sortBy == "proba") {

              if (data[i].proba < prevLowestAlertFilter[0] || prevLowestAlertFilter[0] == -1) {
                prevLowestAlertFilter = {
                  0: data[i].proba,
                  1: 1
                };
              } else if (data[i].proba == prevLowestAlertFilter[0]) {
                prevLowestAlertFilter[1] = prevLowestAlertFilter[1] + 1;
              }

              if (data[i].proba > prevHighestAlertFilter[0] || prevHighestAlertFilter[0] == -1) {
                prevHighestAlertFilter = {
                  0: data[i].proba,
                  1: 1
                };
              } else if (data[i].proba == prevHighestAlertFilter[0]) {
                prevHighestAlertFilter[1] = prevHighestAlertFilter[1] + 1;
              }

            }

            // Assign the timestamp of the alert to the user if the user
            // was not seen before or if the alert is newer
            if (data[i].user.indexOf(newerAlertsByUser) == -1 ||
              data[i].timestamp >= newerAlertsByUser[data[i].user]) {
              newerAlertsByUser[data[i].user] = data[i].timestamp;
            }

            newAlertsFlag = true;

            data[i].currentPages = {
              'submissions': -1,
              'comments': -1
            };
            data[i].tabFocus = 0;
            data[i].prettyTag = $scope.getPrettyTag(data[i].tag);
            data[i].risk_vector = getMatrixFromRiskVector(data[i].risk_vector);
            data[i].index = $scope.alerts.length;

            /* Random color for the avatar */
            if ($scope.avatarColors[data[i].user] == undefined) {
              var random = data[i].user.charCodeAt(data[i].user.length - 1);
              $scope.avatarColors[data[i].user] = colors[random % colors.length];
            }

            $scope.alertIds.push(data[i].id);
            $scope.alerts.push(data[i]);
          }
        }

        if (lowerAlerts && !newAlertsFlag) {
          M.toast({
            html: "There aren't more alerts tagged as '" + $scope.alerts[0].prettyTag + "'"
          });
          return;
        }

        console.log(prevHighestAlertFilter);
        console.log(prevLowestAlertFilter);
        console.log("")

        if (newAlertsFlag) {
          if (!lowerAlerts) {
            var message = "New alerts";
            if ($scope.alerts[0].tag != 'undecided') {
              message += " tagged as '" + $scope.alerts[0].prettyTag + "'";
            }
            M.toast({
              html: message
            });
          }
        }

      });
  }

  $interval(function() {
    if (!$scope.loadLock) {
      $scope.loadAlerts(lowerAlerts = false);
    }
  }, 5000);

  initData = function(firstCall = false) {
    alertBatchSize = 5;

    prevHighestAlertFilter = {
      0: -1, // Filter value
      1: 0 // No. of alerts with the extreme repeated filter
    };

    prevLowestAlertFilter = {
      0: -1,
      1: 0
    };

    newerAlertsByUser = {};

    $scope.alerts = [];
    $scope.alertIds = [];
    $scope.openedAlertIds = [];

    $scope.submissions = {};
    $scope.comments = {};
    $scope.postIds = {};

    // Initialize main tabs
    if (firstCall) {
      $('.tabs').tabs();
    }

    $(document).ready(function() {
      $('.tooltipped').tooltip();
    });

    $scope.loadAlerts(lowerAlerts = false);
  }
  initData(firstCall = true);

  $scope.loadInitialPosts = function(alert) {
    $('.tabs').tabs();
    $('.collapsible').collapsible();
    $scope.loadPosts(alert, 'submissions');
    $scope.loadPosts(alert, 'comments');
  }

  $scope.notSorted = function(obj) {
    if (!obj) {
      return [];
    }
    return Object.keys(obj);
  }

  $scope.loadMorePosts = function(alert) {
    if (alert.tabFocus == 0) {
      $scope.loadPosts(alert, 'submissions');
    } else if (alert.tabFocus == 1) {
      $scope.loadPosts(alert, 'comments');
    }
  }

  $scope.loadPosts = function(alert, entity) {
    if (entity == 'submissions') {
      var posts = $scope.submissions;
    } else if (entity == 'comments') {
      var posts = $scope.comments;
    } else {
      console.log('Unrecognized entity: ' + entity);
      return;
    }

    var firstLoad = false;
    if (posts[alert.id] == undefined) {
      posts[alert.id] = [];
      firstLoad = true;
    }

    if (entity == 'submissions') {
      last_id = alert.last_submission;
    } else if (entity == 'comments') {
      last_id = alert.last_comment;
    }
    // The alert does not affect this kind of entity, return
    if (!last_id){
      return;
    }

    alert.currentPages[entity]++;
    AlertsService.getPosts(entity, alert.user, last_id, postsBatchSize, alert.currentPages[entity])
      .success(function(data) {
        const NO_MORE_X_IN_ALERT = "There aren't more " + entity + " for this alert";

        if (data.length == 0 && !firstLoad) {
          M.toast({
            html: NO_MORE_X_IN_ALERT
          });
          return;
        }

        var newPostsFlag = false;

        for (var i = 0; i < data.length; i++) {
          /* Initialize postIds dict for the current alert */
          if ($scope.postIds[alert.id] == undefined) {
            $scope.postIds[alert.id] = {};
            $scope.postIds[alert.id]['submissions'] = [];
            $scope.postIds[alert.id]['comments'] = [];
          }

          if (entity == 'submissions') {
            var post_id = data[i].submission_id;
          } else if (entity == 'comments') {
            var post_id = data[i].comment_id;
          } /* Add the post_id only if it wasn't added before */
          if ($scope.postIds[alert.id][entity].indexOf(post_id) != -1) {
            continue;
          }

          newPostsFlag = true;

          /* Random color for the subreddit */
          if ($scope.subredditColors[data[i].subreddit_id] == undefined) {
            var random = data[i].subreddit_id.charCodeAt(data[i].subreddit_id.length - 4);
            $scope.subredditColors[data[i].subreddit_id] = colors[random % colors.length];
          }

          $scope.postIds[alert.id][entity].push(post_id);
          posts[alert.id].push(data[i]);
        }

        if (!newPostsFlag) {
          M.toast({
            html: NO_MORE_X_IN_ALERT
          });
        }
      });
  }

  $scope.alertClick = function(alert) {
    // Invert the lock value when the user opens/closes an alert
    $scope.loadLock = !$scope.loadLock;

    if ($scope.openedAlertIds.indexOf(alert.id) == -1) {
      $scope.openedAlertIds.push(alert.id);
      $scope.loadInitialPosts(alert);
    }
  }

  tagAlert = function(alert) {
    AlertsService.tagAlert(alert.id, alert.tag)
      .success(function(data) {
        M.toast({
          html: "Alert tagged as '" + alert.prettyTag + "'"
        })
      });
  }

});
