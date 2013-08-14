'use strict';

// /all
BioASQ.factory('TimelineRes', function ($resource, $window) {
    return $resource(
        'http://' + $window.location.host + ':' + $window.location.port + '/all',
        { id: '@id', callback: 'JSON_CALLBACK' },
        { post: { method: 'POST', params:{ order : '@order'}, isArray: true } }
    );
});

// /questions
BioASQ.factory('QuestionsRes', function ($resource, $window) {
    return $resource(
        'http://' + $window.location.host + ':' + $window.location.port + '/questions',
        { callback: 'JSON_CALLBACK' },
        { get: { method: 'GET', isArray: true } }
    );
});

// /questions/:id
BioASQ.factory('QuestionDetailRes', function ($resource, $window) {
    return $resource(
        'http://' + $window.location.host + ':' + $window.location.port + '/questions/:id',
        { id: '@id', callback: 'JSON_CALLBACK' },
        { get: { method: 'GET', isArray: true } }
    );
});

// /users/:id
BioASQ.factory('UserRes', function ($resource, $window) {
    return $resource(
        'http://' + $window.location.host + ':' + $window.location.port + '/users/:id',
        { id: '@id', callback: 'JSON_CALLBACK' },
        { get: { method: 'GET', isArray: true } }
    );
});

// /comments/:id
BioASQ.factory('CommentsRes', function ($resource, $window) {
    return $resource(
        'http://' + $window.location.host + ':' + $window.location.port + '/comments/:id',
        { id: '@id', callback: 'JSON_CALLBACK' },
        { get: { method: 'GET', isArray: true } }
    );
});

///comment/:id
BioASQ.factory('CommentRes', function ($resource, $window) {
    return $resource(
        'http://' + $window.location.host + ':' + $window.location.port + '/comment/:id',
        { id: '@id', callback: 'JSON_CALLBACK' },
        { post: { method: 'POST', params:{ creator : '@creator', content : '@content', title : '@title'}, isArray: true } }
    );
});
// /followers/:id
BioASQ.factory('FollowersRes', function ($resource, $window) {
    return $resource(
        'http://' + $window.location.host + ':' + $window.location.port + '/followers/:id',
        { id: '@id', callback: 'JSON_CALLBACK' },
        { get: { method: 'GET', isArray: true } }
    );
});

// /following/:id
BioASQ.factory('FollowingRes', function ($resource, $window) {
    return $resource(
        'http://' + $window.location.host + ':' + $window.location.port + '/following/:id',
        { id: '@id', callback: 'JSON_CALLBACK' },
        { get: { method: 'GET', isArray: true } }
    );
});

// /follow/:id
BioASQ.factory('FollowRes', function ($resource, $window) {
    return $resource(
        'http://' + $window.location.host + ':' + $window.location.port + '/follow/:id',
        { id: '@id', callback: 'JSON_CALLBACK' },
        { follow: { method: 'POST', params:{ who : '@who'}, isArray: true } }
    );
});

// /vote/:id
BioASQ.factory('VoteRes', function ($resource, $window) {
    return $resource(
        'http://' + $window.location.host + ':' + $window.location.port + '/vote/:id',
        { id: '@id', callback: 'JSON_CALLBACK' },
        { post: { method: 'POST', params:{ dir : '@dir'}, isArray: true } }
    );
});

// /login
BioASQ.factory('MeRes', function ($resource, $window) {
    return $resource(
        'http://' + $window.location.host + ':' + $window.location.port + '/login',
        { callback: 'JSON_CALLBACK' },
        { login: { method: 'GET', isArray: true } }
    );
});