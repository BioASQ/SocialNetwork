'use strict';

var controllers = angular.module('bioasq.controllers');

controllers.controller('MessageCtrl', function ($scope, Message, Auth, Username, Alert) {
    $scope.itemsPerPage = 10;
    $scope.currentPage  = 1;

    function populate(message, key) {
        message[key] = {
            id:   message[key],
            name: Username.get(message[key])
        };
    }

    function fetchMessagesIfNeeded() {
        var options = {
            limit:  $scope.itemsPerPage,
            offset: ($scope.currentPage - 1) * $scope.itemsPerPage
        };
        if (!$scope.messages) {
            if ($scope.section === 'inbox') {
                $scope.messages = Message.inbox(options, function (results, getHeader) {
                    var resultSize = parseInt(getHeader('X-Result-Size'), 10);
                    $scope.totalItems = resultSize;
                    angular.forEach(results, function (message) { populate(message, 'creator'); });
                });
            } else if ($scope.section === 'outbox') {
                $scope.messages = Message.outbox(options, function (results, getHeader) {
                    var resultSize = parseInt(getHeader('X-Result-Size'), 10);
                    $scope.totalItems = resultSize;
                    angular.forEach(results, function (message) { populate(message, 'to'); });
                });
            }
        }
    }

    $scope.$watch('section', function () {
        $scope.currentPage  = 1;
        delete $scope.messages;
        fetchMessagesIfNeeded();
    });

    $scope.$watch('currentPage', function () {
        delete $scope.messages;
        fetchMessagesIfNeeded();
    });

    $scope.create = function (receipient) {
        $scope.newMessage = {
            creator: Auth.user().id,
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
            creator:         Auth.user().id,
            to:              message.creator.id,
            reply_of:        message.id,
            needsReceipient: false,
            isReply:         true
        };
    };

    $scope.cancel = function () {
        delete $scope.newMessage;
    };

    $scope.send = function (message, form) {
        if (form.$valid) {
            // Clean up view model properties
            if (typeof message.needsReceipient !== 'undefined') { delete message.needsReceipient; }
            if (typeof message.isReply !== 'undefined')         { delete message.isReply; }

            var m = new Message(message);
            m.$send(function () {
                Alert.add({ type: 'success', message: 'Message successfully sent.' });
                delete $scope.newMessage;
            });
        }
    };
});
