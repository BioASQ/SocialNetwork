'use strict';
/**
 * 
 */
BioASQ.HomeCtrl = function($scope, Questions, Users, modalFactory) {
    $scope.currentCtrl = 'HomeCtrl';
    // all ids the current user follows
    Users.getFollowingIds($scope.me.id, function(data) {
        var followingIds = data;
        // get questions
        Questions.getQuestions(function(data) {
            $scope.questions = data != null ? data : "error";
            // mark followed questions
            angular.forEach($scope.questions, function(question, index) {
                question.follows = followingIds.indexOf(question.id) == -1 ? false : true;
            });
        });
    });

    // show question answers and cache them
    $scope.details = [];
    $scope.questionDetail = function(id) {
        Questions.getDetail(id, function(data) {
            $scope.details[id] = data != null ? data : "error";
        });
    };

    // vote a question
    $scope.vote = function(id, dir) {
        Questions.vote(id, dir, function(rank) {
            // ...
        });
    };

    // follow a question
    $scope.follow = function(id) {
        Questions.follow($scope.me.id, id, function(data) {
            // ...
        });
    }

    // modal dialog
    modalFactory.setCacheData({
        title : '',
        message : ''
    });
    $scope.openDialog = function(data) {
        modalFactory.openDialog(modalFactory.options('partials/templates/modal_comment.html', 'DialogCtrl', data), function() {
            // ...
        });
    };

    // show comments
    $scope.comments = [];
    $scope.showComments = function(id) {
        // hide
        if (typeof $scope.comments[id] == 'object') {
            $scope.comments[id] = undefined;
        } else {
            // show
            Users.getComments(id, function(data) {
                $scope.comments[id] = data;
            });
        }
    }
}

/**
 * 
 */
BioASQ.UserCtrl = function($routeParams, $scope, Users, modalFactory) {
    $scope.currentCtrl = 'UserCtrl';

    // user id
    var id = $routeParams.creator;
    Users.getFollowingIds($scope.me.id, function(data) {
        var followingIds = data;
        Users.getUser(id, function(data) {
            $scope.user = data != null ? data : "error";
            $scope.user.follows = followingIds.indexOf(id) == -1 ? false : true;
        });
    });

    $scope.showFollowing = function() {
        Users.getFollowing(id, function(data) {
            $scope.data = data;
        });
    };
    // default
    $scope.showFollowing(id);

    $scope.showFollowers = function() {
        Users.getFollowers(id, function(data) {
            $scope.data = data;
        });
    };

    $scope.follow = function() {
        Users.follow($scope.me.id, $scope.user.id, function() {
            // update table if open
            if ($scope.radioModel == 'followers')
                $scope.showFollowers();
        });
    }

    // modal dialog
    modalFactory.setCacheData({
        title : '',
        message : ''
    });
    $scope.openDialog = function(data) {
        modalFactory.openDialog(modalFactory.options('partials/templates/modal_comment.html', 'DialogCtrl', data), function() {
            // update table if open
            if ($scope.radioModel == 'comments') {
                $scope.showComments(id); // hide
                $scope.showComments(id); // show
            }
        });
    };
    // show comments
    $scope.comments = [];
    $scope.showComments = function(p_id) {
        // hide
        if (typeof $scope.comments[p_id] == 'object') {
            $scope.comments[p_id] = undefined;
        } else {
            // show
            Users.getComments(p_id, function(data) {
                $scope.comments[p_id] = data;
                if(p_id == id){
                    $scope.data = $scope.comments[p_id];
                }
            });
        }
    }
}

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

/**
 * 
 */
BioASQ.MessageCtrl = function($scope) {
    $scope.currentCtrl = 'MessageCtrl';
}

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

BioASQ.controller('HomeCtrl', BioASQ.HomeCtrl);
BioASQ.controller('UserCtrl', BioASQ.UserCtrl);
BioASQ.controller('TimelineCtrl', BioASQ.TimelineCtrl);
BioASQ.controller('MessageCtrl', BioASQ.MessageCtrl);
