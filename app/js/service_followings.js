'use strict';

angular.module('bioasq.services').factory('Followings', function ($q, Auth, Activity, Question, User) {
    var followings  = {},
        unresolved  = {},
        dataFetched = false;

    Activity.following({ id: Auth.user().id }, function (result) {
        result.forEach(function (f) {
            followings[f.about] = f;
        });
        dataFetched = true;

        angular.forEach(unresolved, function (deferred, id) {
            deferred.resolve(!!followings[id]);
            delete unresolved[deferred];
        });
    });

    var resources = {
        'Question': Question,
        'User':     User
    };

    return {
        isFollowing: function (id) {
            var deferred = $q.defer();
            
            // If we have data already, resolve the deferred immediately.
            // Otherwise keep it around to be resolved later.
            if (dataFetched) {
                deferred.resolve(!!followings[id]);
            } else {
                unresolved[id] = deferred;
            }
            return deferred.promise;
        },
        add: function (f) {
            if (!followings[f.about]) {
                resources[f.type].follow({ id: f.about }, { creator: f.me});
                followings[f.about] = true;
            }
        },
        remove: function (f) {
            if (!!followings[f.about]) {
                resources[f.type].unfollow({ id: f.about }, { me: f.me });
                delete followings[f.about];
            }
        }
    };
});
