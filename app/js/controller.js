'use strict';

BioASQ.controller('HomeCtrl', function ($scope, BioAsqService) {

    // get questions
    BioAsqService.getQuestions(function (data) {
        $scope.questions = data != null ? data : "error";
    });


    // init detail
    $scope.detail    = {};
    $scope.detail.id = "";

    // ng-click
    $scope.questionDetail = function (id){
        // hide
        if ($scope.detail.id == id) {
            $scope.detail.id = "";
        } else {
            // show
            BioAsqService.getDetail(id, function (data) {
                if (data) {
                    $scope.detail.id     = id;
                    $scope.detail.answer = data.answer;
                    $scope.detail.ideal  = data.ideal;
                }
            });
        }
    };

});


BioASQ.controller('TimelineCtrl', function ($scope, $location) {
    $scope.title = $location.path();
});


BioASQ.controller('CommentsCtrl', function ($scope, $location) {
    $scope.title = $location.path();
});


BioASQ.controller('UserCtrl', function ($scope, $location) {
    $scope.title = $location.path();
});
