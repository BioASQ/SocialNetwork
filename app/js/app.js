'use strict';

var dependencies = [
    'bioasq.filters',
    'bioasq.resources',
    'bioasq.controllers',
    'bioasq.services',
    'ngSanitize',
    'ui',
    'ui.bootstrap',
    'ui.filters',
    'ngCookies'
];

var BioASQ = angular.module('BioASQ', dependencies);

BioASQ.constant('pages', [
    { routeName: 'home', controllerName: 'HomeCtrl', description: 'activitites of people/things you follow' },
    { routeName: 'messages', controllerName: 'MessageCtrl', description: 'received/sent messages' },
    { routeName: 'timeline', controllerName: 'TimelineCtrl', description: 'all activities' },
    { routeName: 'questions', controllerName: 'QuestionController', description: 'all questions' },
    { routeName: 'users', controllerName: 'UsersCtrl', description: 'all users' }
]);

BioASQ.config(['$routeProvider', 'pages', function ($routeProvider, pages) {
    angular.forEach(pages, function (config) {
        $routeProvider.when('/' + config.routeName, {
            templateUrl: 'templates/' + config.routeName + '.html',
            controller: config.controllerName
        });
        if (!config.label) {
            config.label = config.routeName.substr(0, 1).toUpperCase() + config.routeName.substr(1);
        }
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
    $routeProvider.when('/404', {
        templateUrl: 'templates/404.html',
    });

    $routeProvider.when('/', {
        redirectTo: '/home'
    });
    $routeProvider.otherwise({
       redirectTo: '/404'
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
            } if (response.status === 404) {
                  $location.path('404');
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
            $rootScope.previousPath = $location.path().replace(/^.*#!\//,'');
            $location.path('signin');
        }
        Alert.reset();
    });
});
