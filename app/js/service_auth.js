'use strict';

angular.module('bioasq.services').factory('Auth', function ($q, $cookies, Backend, User) {
    var defaultUser  = { id: '' },
        currentUser  = { id: $cookies.uid || defaultUser.id },
        nameDeferred = $q.defer();

    if (!!currentUser.id) {
        User.get({ id: currentUser.id }, function (user) {
            currentUser = user;
            nameDeferred.resolve([ user.first_name, user.last_name ].join(' '));
        });
    }

    return {
        user: function () {
            return currentUser;
        },
        name: function () {
            return nameDeferred.promise;
        },
        isSignedIn: function () {
            return (currentUser.id !== defaultUser.id);
        },
        signin: function (credentials, success, error) {
            Backend.login(
                credentials,
                function (user) {
                    $cookies.uid = user.id;
                    currentUser  = user;
                    success(currentUser);
                }, function (response) {
                    error(response);
                });
        },
        signout: function (success) {
            Backend.logout(function () {
                currentUser  = defaultUser;
                $cookies.uid = defaultUser.uid;
                success();
            });
        },
        register: function (user, success, error) {
            Backend.register(
                user,
                function (result) {
                    // TODO: activation?
                    success(result);
                }, function (response) {
                    error(response);
                }
            );
        }
    };
});
