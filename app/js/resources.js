'use strict';

/* 
 * Angular $resource definitions.
 * @see http://docs.angularjs.org/api/ngResource.$resource
 */

BioASQ.factory('Activity', function ($resource) {
    return $resource(
        '/users/:id/:action',
        { id: '@id' },
        {
            global:    { method: 'GET', isArray: true, url: '/activities' },
            query:     { method: 'GET', isArray: true, params: { action: 'activities'} },
            following: { method: 'GET', isArray: true, params: { action: 'following'} },
            followers: { method: 'GET', isArray: true, params: { action: 'followers'} }
        }
    );
});

BioASQ.factory('Home', function ($resource) {
    return $resource(
        '/home/user/:id',
        { id: '@id' }
    );
});

BioASQ.factory('User', function ($resource) {
    return $resource(
        '/users/:id/:action',
        { id: '@id' },
        {
            follow:    { method: 'POST',               params: { action: 'followers'} },
            message:   { method: 'POST',               params: { action: 'messages'} }
        }
    );
});

BioASQ.factory('Question', function ($resource) {
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

BioASQ.factory('Comment', function ($resource) {
    return $resource(
        '/comments/:id/:action',
        { id: '@id' },
        {
            replies: { method: 'GET', isArray: true, params: { action: 'replies'} },
            reply:   { method: 'POST',               params: { action: 'replies'} }
        }
    );
});

BioASQ.factory('Message', function ($resource) {
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