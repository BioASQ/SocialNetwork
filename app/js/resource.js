'use strict';
/**
 *
 **/
BioASQ.factory('QuestionsRes', function ($resource, $window) {
    return $resource(
        'http://' + $window.location.host + ':' + $window.location.port + '/questions',
        { callback: 'JSON_CALLBACK' },
        { get: { method: 'GET', isArray: true } }
    );
});

BioASQ.factory('QuestionDetailRes', function ($resource, $window) {
    return $resource(
        'http://' + $window.location.host + ':' + $window.location.port + '/questions/:id',
        { id: "@id", callback: 'JSON_CALLBACK' },
        { get: { method: 'GET', isArray: true } }
    );
});
/**
 *
 **/
BioASQ.factory('UserRes', function ($resource, $window) {
    return $resource(
        'http://' + $window.location.host + ':' + $window.location.port + '/users/:id',
        { id: "@id", callback: 'JSON_CALLBACK' },
        { get: { method: 'GET', isArray: true } }
    );
});

BioASQ.factory('CommentsRes', function ($resource, $window) {
    return $resource(
        'http://' + $window.location.host + ':' + $window.location.port + '/comments/:id',
        { id: "@id", callback: 'JSON_CALLBACK' },
        { get: { method: 'GET', isArray: true } }
    );
});

BioASQ.factory('FollowersRes', function ($resource, $window) {
    return $resource(
        'http://' + $window.location.host + ':' + $window.location.port + '/followers/:id',
        { id: "@id", callback: 'JSON_CALLBACK' },
        { get: { method: 'GET', isArray: true } }
    );
});

BioASQ.factory('FollowingRes', function ($resource, $window) {
    return $resource(
        'http://' + $window.location.host + ':' + $window.location.port + '/following/:id',
        { id: "@id", callback: 'JSON_CALLBACK' },
        { get: { method: 'GET', isArray: true } }
    );
});