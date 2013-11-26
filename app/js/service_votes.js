angular.module('bioasq.services').factory('Votes', function ($q, Auth, Activity, Question, User) {
    'use strict';

    var votes       = {},
        unresolved  = {},
        dataFetched = false;

    Activity.votes({ id: Auth.user().id }, function (result) {
        result.forEach(function (vote) {
            votes[vote.about] = vote.dir;
        });
        dataFetched = true;

        angular.forEach(unresolved, function (deferred, id) {
            deferred.resolve(followings[id]);
            delete unresolved[deferred];
        });
    });

    return {
        voteForID: function (id) {
            var deferred = $q.defer();

            // If we have data already, resolve the deferred immediately.
            // Otherwise keep it around to be resolved later.
            if (dataFetched) {
                deferred.resolve(votes[id]);
            } else {
                unresolved[id] = deferred;
            }

            return deferred.promise;
        },
        add: function (about, dir, cb) {
            if (votes[about] === dir) {
                return cb();
            } else {
                votes[about] = dir;
                Question.vote(
                    { id: about },
                    { creator: Auth.user().id, about: about, dir: dir },
                    function (response) {
                        cb(response.rank);
                    });
            }
        },
        remove: function (about, cb) {
            delete votes[about];
            Question.unvote(
                { id: about },
                { creator: Auth.user().id, about: about },
                function (response) {
                    cb(response.rank);
                });
        }
    };
});
