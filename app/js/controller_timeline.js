'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('TimelineCtrl', function ($scope, TimelineRes, Question) {
    $scope.currentCtrl = 'TimelineCtrl';
    var order = '';

    TimelineRes.post({
        order: order
    }, function(data, headers) {
        $scope.data = data;
    }, function(response) {
        $scope.data = [];
        //callback(null);
    });
});
