'use strict';

/**
 *
 */
BioASQ.HomeCtrl = function($scope, Activity, modalFactory) {
    $scope.currentCtrl = 'HomeCtrl';
    $scope.activities  = Activity.home({ id: $scope.me.id });

    // modal dialog
    modalFactory.setCacheData({
        title: '',
        message: ''
    });
    $scope.openDialog = function(data) {
        modalFactory.openDialog(modalFactory.options('templates/partials/modal_comment.html', 'DialogCtrl', data), function() {
            // ...
        });
    };
};

BioASQ.controller('HomeCtrl', BioASQ.HomeCtrl);
