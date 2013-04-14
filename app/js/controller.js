'use strict';
/**
 *
 */
BioASQ.HomeCtrl = function ($scope, $location, Questions) {
    // get questions
    Questions.getQuestions(function (data) {
        $scope.questions = data != null ? data : "error";
    });

    // init detail
    $scope.detail = { id : "" };

    // ng-click detail
    $scope.questionDetail = function (id){
        // hide
        if ($scope.detail.id == id) {
            $scope.detail.id = "";
        } else {
            // show
            Questions.getDetail(id, function (data) {
                if (data != null) {
                    $scope.detail = {
                                        id : id,
                                        answer : data.answer,
                                        ideal : data.ideal
                                    }
                }
            });
        }
    };
};

/**
 *
 */
BioASQ.UserCtrl =  function ($scope, $location, Users) {
    // http://.../#/user/id
    var id = $location.path().substr($location.path().lastIndexOf('/') + 1);
    Users.getUser(id, function (data) {
        $scope.user = data != null ? data : "error";
    });

    $scope.showFollowing = function(id){
        Users.getFollowing(id, function(data){
            $scope.data = data;
        });
    };
    // default 
    $scope.showFollowing(id);

    $scope.showComments = function(id){
        Users.getComments(id, function(data){
            $scope.data = data;
        });
    };

    $scope.showFollowers = function(id){
        Users.getFollowers(id, function(data){
            $scope.data = data;
        });
    };
};

/**
 *
 */
BioASQ.TimelineCtrl = function ($scope, $location) {
};

/**
 *
 */
BioASQ.MessageCtrl =  function ($scope, $location) {
};

BioASQ.controller('HomeCtrl', BioASQ.HomeCtrl);
BioASQ.controller('UserCtrl', BioASQ.UserCtrl);
BioASQ.controller('TimelineCtrl', BioASQ.TimelineCtrl);
BioASQ.controller('MessageCtrl', BioASQ.MessageCtrl);
