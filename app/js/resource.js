'use strict';

BioASQ.factory('QuestionsRes', function ($resource, $window) {
    return $resource(
        'http://' + window.location.host + ':' + window.location.port + '/data/questions.js', 
        { callback: 'JSON_CALLBACK' },
        { get: { method: 'GET', isArray: true } }
    );
});

BioASQ.factory('DetailRes', function ($resource, $window) {
    return $resource(
        'http://' + window.location.host + ':' + window.location.port + '/data/detail/:id/detail.js', 
        { id: "@id", callback: 'JSON_CALLBACK' },
        { get: { method: 'GET', isArray: true } }
    );
});

// how to use $window ? 
// use instead of window
