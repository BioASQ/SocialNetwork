'use strict';

angular.module('bioasq.services').factory('Alert', function ($rootScope) {
    $rootScope.alerts = [];

    return {
        add: function (alert) {
            $rootScope.alerts.push(alert);
        },
        remove: function (index) {
            $rootScope.alerts.splice(index, 1);
        },
        reset: function () {
            $rootScope.alerts = [];
        }
    };
});
