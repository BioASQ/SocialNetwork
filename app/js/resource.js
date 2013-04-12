'use strict';
BioASQ.factory('QuestionsRes', function ($resource, $window) {
    return $resource(
        'http://' + $window.location.host + ':' + $window.location.port + '/data/questions.js',
        { callback: 'JSON_CALLBACK' },
        { get: { method: 'GET', isArray: true } }
    );
});

BioASQ.factory('QuestionDetailRes', function ($resource, $window) {
    return $resource(
        'http://' + $window.location.host + ':' + $window.location.port + '/data/detail/:id/detail.js',
        { id: "@id", callback: 'JSON_CALLBACK' },
        { get: { method: 'GET', isArray: true } }
    );
});

BioASQ.factory('UserRes', function ($resource, $window) {
    return $resource(
        'http://' + $window.location.host + ':' + $window.location.port + '/data/user/:id/user.js',
        { id: "@id", callback: 'JSON_CALLBACK' },
        { get: { method: 'GET', isArray: true } }
    );
});

BioASQ.factory('CommentsRes', function ($resource, $window) {
    return $resource(
        'http://' + $window.location.host + ':' + $window.location.port + '/data/user/:id/comments.js',
        { id: "@id", callback: 'JSON_CALLBACK' },
        { get: { method: 'GET', isArray: true } }
    );
});

BioASQ.factory('FollowersRes', function ($resource, $window) {
    return $resource(
        'http://' + $window.location.host + ':' + $window.location.port + '/data/user/:id/followers.js',
        { id: "@id", callback: 'JSON_CALLBACK' },
        { get: { method: 'GET', isArray: true } }
    );
});

BioASQ.factory('FollowingRes', function ($resource, $window) {
    return $resource(
        'http://' + $window.location.host + ':' + $window.location.port + '/data/user/:id/following.js',
        { id: "@id", callback: 'JSON_CALLBACK' },
        { get: { method: 'GET', isArray: true } }
    );
});