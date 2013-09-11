'use strict';

angular.module('bioasq.services').factory('Username', function ($q, User) {
    var users = {};
    return {
        get: function (id) {
            var deferred = $q.defer();
            if (users[id]) {
                deferred.resolve(users[id]);
            } else {
                User.get({ id: id }, function (user) {
                    users[id] = [ user.first_name, user.last_name ].join(' ');
                    deferred.resolve(users[id]);
                });
            }
            return deferred.promise;
        }
    };
});
