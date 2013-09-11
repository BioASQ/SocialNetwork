'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('TimelineCtrl', function ($scope, Activity, Username) {
    function populate(message, key) {
        message[key] = {
            id:   message[key],
            name: Username.get(message[key])
        };
    }

    $scope.activities = Activity.global({}, {}, function (results) {
        angular.forEach(results, function (activity) {
            populate(activity, 'creator');
            if (activity.type === 'Follow' && activity.about_type === 'User') {
                populate(activity, 'about');
            }
        });
    });
});
