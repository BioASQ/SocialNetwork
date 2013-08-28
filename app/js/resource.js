'use strict';

// /all
BioASQ.factory('TimelineRes', function($resource, $window) {
    return $resource(
        '/activities', {}, {
            post: {
                method: 'GET',
                isArray: true
            }
        }
    );
});

// /users/:id
BioASQ.factory('UserRes', function($resource, $window) {
    return $resource(
        '/users/:id', {
            id: '@id'
        }, {
            get: {
                method: 'GET'
            }
        }
    );
});

// /comments/:id
BioASQ.factory('CommentsRes', function($resource, $window) {
    return $resource(
        '/comments/:id', {
            id: '@id'
        }, {
            get: {
                method: 'GET'
            }
        }
    );
});

///comment/:id
BioASQ.factory('CommentRes', function($resource, $window) {
    return $resource(
        '/comments', {}, {
            post: {
                method: 'POST',
                params: {
                    creator: '@creator',
                    about: '@id',
                    content: '@content',
                    title: '@title'
                }
            }
        }
    );
});
// /followers/:id
BioASQ.factory('FollowersRes', function($resource, $window) {
    return $resource(
        '/users/:id/followers', {
            id: '@id'
        }, {
            get: {
                method: 'GET',
                isArray: true
            }
        }
    );
});

// /following/:id
BioASQ.factory('FollowingRes', function($resource, $window) {
    return $resource(
        '/users/:id/following', {
            id: '@id'
        }, {
            get: {
                method: 'GET',
                isArray: true
            }
        }
    );
});

// /follow/:id
BioASQ.factory('FollowRes', function($resource, $window) {
    return $resource(
        '/users/:id/following', {
            id: '@id'
        }, {
            follow: {
                method: 'POST',
                params: {
                    about: '@about'
                }
            }
        }
    );
});

// /vote/:id
BioASQ.factory('VoteRes', function($resource, $window) {
    return $resource(
        '/questions/:id/votes', {
            id: '@id'
        }, {
            post: {
                method: 'POST',
                params: {
                    dir: '@dir'
                }
            }
        }
    );
});

// /login
BioASQ.factory('MeRes', function($resource, $window) {
    return $resource(
        '/login', {}, {
            login: {
                method: 'GET'
            }
        }
    );
});
