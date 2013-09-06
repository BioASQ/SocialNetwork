'use strict';

var dependencies = [
    'bioasq.filters',
    'bioasq.resources',
    'bioasq.controllers',
    'bioasq.services',
    'ngSanitize',
    'ui.bootstrap',
    'ui'
];

var BioASQ = angular.module('BioASQ', dependencies);

BioASQ.constant('pages', {
    home: { controllerName: 'HomeCtrl', description: 'activitites of people/things you follow' },
    messages: { controllerName: 'MessageCtrl', description: 'received/sent messages' },
    timeline: { controllerName: 'TimelineCtrl', description: 'all activities' },
    questions: { controllerName: 'QuestionController', description: 'all questions' }
});

BioASQ.config(['$provide', '$routeProvider', 'pages', function ($provide, $routeProvider, pages) {
    angular.forEach(pages, function (config, page) {
        $routeProvider.when('/' + page, {
            templateUrl: 'templates/' + page + '.html',
            controller: config.controllerName
        });
    });

    $routeProvider.when('/users/:creator', {
        templateUrl: 'templates/user.html',
        controller: 'UserCtrl'
    });

    $routeProvider.when('/registration/:code', {
        templateUrl: 'templates/registration.html',
        controller: 'RegistrationCtrl'
    });

    $routeProvider.when('/registration', {
        templateUrl: 'templates/registration.html',
        controller: 'RegistrationCtrl'
    });

    $routeProvider.otherwise({
        //redirectTo: '/' + BioASQ.pages[0]
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
    });
}]);

BioASQ.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.html5Mode(false).hashPrefix('!');
}]);

BioASQ.run(function (pages, $rootScope, Me, Activity) {
    $rootScope.pages = pages;
    $rootScope.cache = {
        followings: []
    };
    $rootScope.me = {
        id: 'anonymous'
    };

    // u1
    var login = 'foo@bar.com', password = 'secret';

    /*
     * // u2
     * var login = 'expert2@example.com', password = 'start$123';
     */

    Me.login(login, password, function (user) {
        $rootScope.me = user;
        Activity.following({ id: user.id }, function (result) {
            $rootScope.cache.followings = result.map(function (f) {
                return f.about;
            });
        });
    });
});
