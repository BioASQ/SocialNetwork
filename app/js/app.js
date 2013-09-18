'use strict';

var dependencies = [
    'bioasq.filters',
    'bioasq.resources',
    'bioasq.controllers',
    'bioasq.services',
    'ngSanitize',
    'ui.bootstrap',
    'ui',
    'ngCookies'
];

var BioASQ = angular.module('BioASQ', dependencies);

BioASQ.constant('pages', {
    home: { controllerName: 'HomeCtrl', description: 'activitites of people/things you follow' },
    messages: { controllerName: 'MessageCtrl', description: 'received/sent messages' },
    timeline: { controllerName: 'TimelineCtrl', description: 'all activities' },
    questions: { controllerName: 'QuestionController', description: 'all questions' }
});

BioASQ.config(['$routeProvider', 'pages', function ($routeProvider, pages) {
    angular.forEach(pages, function (config, page) {
        $routeProvider.when('/' + page, {
            templateUrl: 'templates/' + page + '.html',
            controller: config.controllerName
        });
    });

    $routeProvider.when('/questions/:id', {
        templateUrl: 'templates/questions.html',
        controller: 'QuestionController'
    });

    $routeProvider.when('/users/:creator', {
        templateUrl: 'templates/user.html',
        controller: 'UserCtrl'
    });

    $routeProvider.when('/request', {
        templateUrl: 'templates/authentication.html',
        controller: 'AuthenticationCtrl'
    });

    $routeProvider.when('/reset/:code', {
        templateUrl: 'templates/authentication.html',
        controller: 'AuthenticationCtrl'
    });

    $routeProvider.when('/register', {
        templateUrl: 'templates/authentication.html',
        controller: 'AuthenticationCtrl'
    });

    $routeProvider.when('/register/:code', {
        templateUrl: 'templates/authentication.html',
        controller: 'AuthenticationCtrl'
    });

    $routeProvider.when('/signin', {
        templateUrl: 'templates/authentication.html',
        controller: 'AuthenticationCtrl'
    });

    $routeProvider.when('/', {
        redirectTo: '/home'
    });

    $routeProvider.otherwise({
        templateUrl: 'templates/authentication.html',
        controller: 'AuthenticationCtrl'
    });
}]);

BioASQ.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.html5Mode(false).hashPrefix('!');
}]);

BioASQ.config(['$httpProvider', function ($httpProvider) {
    // redirects to the signin page in case of a 401
    $httpProvider.responseInterceptors.push(['$location', '$q', function ($location, $q) {
        function success(response) {
            return response;
        }
        function error(response) {
            if (response.status === 401) {
                // except for user details
                if (response.config.url.indexOf('/preferences') === -1) {
                    $location.path('signin');
                }
                return $q.reject(response);
            } else {
                return $q.reject(response);
            }
        }
        return function (promise) {
            return promise.then(success, error);
        };
    }]);
}]);

BioASQ.run(function (pages, $rootScope, $location, Auth, Alert) {
    $rootScope.pages = pages;
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        if (!Auth.isSignedIn() && next.controller !== 'AuthenticationCtrl') {
            $location.path('signin');
        }
        Alert.reset();
    });
});
