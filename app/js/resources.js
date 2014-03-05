'use strict';

var resources = angular.module('bioasq.resources', [ 'ngResource' ]);

/* 
 * Angular $resource definitions.
 * @see http://docs.angularjs.org/api/ngResource.$resource
 */

resources.factory('Activity', function ($resource) {
    return $resource(
        '/:section/:id/:action',
        { id: '@id', section: 'users' },
        {
            global:    { method: 'GET', isArray: true, params: { section: 'activities' } },
            home:      { method: 'GET', isArray: true, params: { action: 'home'} },
            query:     { method: 'GET', isArray: true, params: { action: 'activities'} },
            following: { method: 'GET', isArray: true, params: { action: 'following'} },
            followers: { method: 'GET', isArray: true, params: { action: 'followers'} },
            votes:     { method: 'GET', isArray: true, params: { action: 'votes'} }
        }
    );
});

resources.factory('Home', function ($resource) {
    return $resource(
        '/home/user/:id',
        { id: '@id' }
    );
});

resources.factory('User', function ($resource) {
    return $resource(
        '/users/:id/:action/:value',
        { id: '@id', value: '@me' },
        {
            query:     { method: 'GET', isArray: true },
            follow:      { method: 'POST',   params: { action: 'followers' } },
            unfollow:    { method: 'DELETE', params: { action: 'followers' } },
            message:     { method: 'POST',   params: { action: 'messages' } },
            details:     { method: 'GET',    params: { action: 'preferences'} },
            preferences: { method: 'POST',   params: { action: 'preferences'} }
        }
    );
});

resources.factory('Question', function ($resource) {
    return $resource(
        '/questions/:id/:action/:value',
        { id: '@id', value: '@me' },
        {
            query:     { method: 'GET', isArray: true },
            search:    { method: 'GET', isArray: true, params: { action: 'search' } },
            followers: { method: 'GET', isArray: true, params: { action: 'followers'} },
            comments:  { method: 'GET', isArray: true, params: { action: 'comments'} },
            follow:    { method: 'POST',               params: { action: 'followers'} },
            unfollow:  { method: 'DELETE',             params: { action: 'followers'} },
            vote:      { method: 'POST',               params: { action: 'votes'} },
            unvote:    { method: 'DELETE',             params: { action: 'votes'} },
            comment:   { method: 'POST',               params: { action: 'comments'} }
        }
    );
});

resources.factory('Comment', function ($resource) {
    return $resource(
        '/comments/:id/:action',
        { id: '@id' },
        {
            replies: { method: 'GET', isArray: true, params: { action: 'replies'} },
            reply:   { method: 'POST',               params: { action: 'replies'} }
        }
    );
});

resources.factory('Message', function ($resource) {
    return $resource(
        '/messages/:action',
        {},
        {
            inbox:  { method: 'GET', isArray: true, params: { action: 'in' } },
            outbox: { method: 'GET', isArray: true, params: { action: 'out' } },
            send:   { method: 'POST' }
        }
    );
});

resources.factory('Backend', function ($resource) {
    return $resource(
        '/:action',
        {},
        {
            login:    { method: 'POST', params: { action: 'login'} },
            logout:   { method: 'GET',  params: { action: 'logout'} },
            register: { method: 'POST', params: { action: 'register'} },
            reset:    { method: 'POST', params: { action: 'reset' } },
            request:  { method: 'POST', params: { action: 'request' } },
            refresh:  { method: 'GET',  params: { action: 'refresh' } }
        }
    );
});
