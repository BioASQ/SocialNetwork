'use strict';

/**
 *
 */
BioASQ.HomeCtrl = function($scope, User, Question, Comment, modalFactory) {
    $scope.currentCtrl = 'HomeCtrl';

    // set user
    var user = {
        id: $scope.me.id
    };

    // questions id to index
    var idToIndex = {};

    // get questions
    Question.query(
        function(questions, headers) { // success

            $scope.questions = questions;

            // fill questions id to index
            angular.forEach(questions, function(question, index) {
                idToIndex[question.id] = index;
            });

            // mark followed
            User.following(user,
                function(followings, headers) { // success
                    angular.forEach(followings, function(following, index) {
                        questions[idToIndex[following.about]].follows = following.creator == user.id ? true : false;
                    });
                }
            );
        }
    );

    // vote a question
    $scope.vote = function(questionID, dir) {
        Question.vote({
            id: questionID
        }, {
            creator: user.id,
            about: questionID,
            dir: dir
        }, function(response) {
            $scope.questions[idToIndex[questionID]].rank = response.rank;
        });
    };

    // follow a question
    $scope.follow = function(questionID) {
        var index = idToIndex[questionID];

        if (!$scope.questions[index].follows) {
            Question.follow({
                id: questionID
            }, {
                creator: user.id
            }, function(questions, headers) { // success

                $scope.questions[index].follows = true;

            });
        } else {
            Question.unfollow({
                id: questionID
            }, {
                creator: user.id,
                followerID: user.id
            }, function(questions, headers) { // success

                $scope.questions[index].follows = false;

            }, function(response) { // error
                alert('Error: Question.unfollow: status ' + response.status);
            });
        }
    };

    // comments
    $scope.openComments = function(questionID) {
        Question.comments({
            id: questionID
        }, function(comments, headers) { // success
            $scope.questions[idToIndex[questionID]].comments = comments;
        });
    }

    // comments replies
    $scope.openReplies = function(commentID) {
        Comment.replies({
            id: commentID
        }, function(replies, headers) { // success
            $scope.questions[idToIndex[questionID]].comments.replies = replies;
        }, function(response) { // error
            alert('Error: Comment.replies: status ' + response.status);
        });
    }

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
