'use strict';

/**
 *
 */
BioASQ.MessageCtrl = function($scope, Message) {
    $scope.currentCtrl = 'MessageCtrl';

    $scope.$watch('section', function () {
        if ($scope.section === 'inbox') {
            $scope.messages = Message.inbox();
        } else {
            $scope.messages = Message.outbox();
        }
    });
    $scope.section = 'inbox';
};

BioASQ.controller('MessageCtrl', BioASQ.MessageCtrl);
