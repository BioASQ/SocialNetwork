'use strict';

var resources = angular.module('bioasq.resources', [ 'ngResource' ]);

/* 
 * Angular $resource definitions.
 * @see http://docs.angularjs.org/api/ngResource.$resource
 */

resources.factory('Activity', function ($resource) {
    return $resource(
        '/users/:id/:action',
        { id: '@id' },
        {
            global:    { method: 'GET', isArray: true, url: '/activities' },
            home:      { method: 'GET', isArray: true, params: { action: 'home'} },
            query:     { method: 'GET', isArray: true, params: { action: 'activities'} },
            following: { method: 'GET', isArray: true, params: { action: 'following'} },
            followers: { method: 'GET', isArray: true, params: { action: 'followers'} }
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
        '/users/:id/:action/:me',
        { id: '@id', me: '@me' },
        {
            follow:    { method: 'POST',   params: { action: 'followers' } },
            unfollow:  { method: 'DELETE', params: { action: 'followers' } },
            message:   { method: 'POST',   params: { action: 'messages' } }
        }
    );
});

resources.factory('Question', function ($resource) {
    return $resource(
        '/questions/:id/:action/:follower',
        { id: '@id', follower: '@followerID' },
        {
            query:     { method: 'GET', isArray: true },
            followers: { method: 'GET', isArray: true, params: { action: 'followers'} },
            comments:  { method: 'GET', isArray: true, params: { action: 'comments'} },
            follow:    { method: 'POST',               params: { action: 'followers'} },
            unfollow:  { method: 'DELETE',             params: { action: 'followers'} },
            vote:      { method: 'POST',               params: { action: 'votes'} },
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

resources.factory('Me', function ($resource) {
    return $resource(
        '/login',
        {},
        {
            login:    { method: 'POST', params: { action: 'login'} },
            register: { method: 'POST', params: { action: 'register'} },
            remember: { method: 'GET' },
            preferences: { method: 'POST', params: { action: 'preferences'} }
        }
    );
});
