'use strict';

/**
 * 
 */
BioASQ.TimelineCtrl = function($scope, TimelineRes) {
    $scope.currentCtrl = 'TimelineCtrl';
    var order = '';

    TimelineRes.post({
        order : order
    }, function(data, headers) {
        $scope.data = data;
    }, function(response) {
        $scope.data = [];
        //callback(null);
    });
}
BioASQ.controller('TimelineCtrl', BioASQ.TimelineCtrl);
