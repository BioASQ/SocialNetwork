'use strict';

/**
 * 
 */
BioASQ.DialogCtrl = function($scope, dialog, CommentRes, modalFactory) {
    $scope.currentCtrl = 'DialogCtrl';
    $scope.data = modalFactory.getData();
    $scope.input = modalFactory.getCacheData();

    // cache last user input
    $scope.save = function(title, message) {
        modalFactory.setCacheData({
            title : title,
            message : message
        });
    }

    // send message
    $scope.send = function(title, message, id) {
        CommentRes.post({
            id : id,
            creator : $scope.me,
            content : JSON.stringify(message),
            title : JSON.stringify(title)
        }, function(data, headers) {
            $scope.close();
        }, function(response) {
            // ...
        });
    }

    // close modal
    $scope.close = function() {
        dialog.close();
    }
}

BioASQ.controller('DialogCtrl', BioASQ.DialogCtrl);
