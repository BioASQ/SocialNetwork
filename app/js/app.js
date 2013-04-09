'use strict';

var BioASQ = angular.module('BioASQ', ['ngResource']);

BioASQ.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/home', {templateUrl: 'partials/home.html', controller: 'HomeCtrl'});
	$routeProvider.when('/timeline', {templateUrl: 'partials/timeline.html', controller: 'TimelineCtrl'});	
	$routeProvider.when('/comments', {templateUrl: 'partials/comments.html', controller: 'CommentsCtrl'});
	$routeProvider.when('/user/:creator', {templateUrl: 'partials/user.html', controller: 'UserCtrl'});
	$routeProvider.otherwise({redirectTo: '/home'});
}]);