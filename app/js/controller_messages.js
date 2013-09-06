'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('MessageCtrl', function ($scope, Message) {
    $scope.currentCtrl = 'MessageCtrl';

    $scope.$watch('section', function () {
        if ($scope.section === 'inbox') {
            $scope.messages = Message.inbox();
        } else if ($scope.section === 'outbox') {
            $scope.messages = Message.outbox();
        }
    });

    $scope.create = function (receipient) {
        $scope.newMessage = {
            creator: $scope.me.id,
            isReply: false
        };

        if (typeof receipient !== 'undefined') {
            $scope.newMessage.to = receipient;
            $scope.newMessage.needsReceipient = false;
        } else {
            $scope.newMessage.needsReceipient = true;
        }
    };

    $scope.reply = function (message) {
        $scope.newMessage = {
            creator:         $scope.me.id,
            to:              message.creator,
            reply_to:        message.id,
            needsReceipient: false,
            isReply:         true
        };
    };

    $scope.cancel = function () {
        delete $scope.newMessage;
    };

    $scope.send = function (message) {
        if (message.creating) {
            delete message.needsReceipient;
            delete message.isReply;
        }
        var m = new Message(message);
        m.$send(function () {
            alert('Message successfully sent.');
            delete $scope.newMessage;
        });
    };
});
