'use strict';

angular.module('bioasq.services').factory('Auth', function ($q, $cookies, Backend, User) {
    var defaultUser  = { id: '' },
        currentUser  = { id: $cookies.uid || defaultUser.id },
        nameDeferred = $q.defer();

    delete $cookies.uid;

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
                    currentUser  = user;
                    nameDeferred.resolve([ user.first_name, user.last_name ].join(' '));
                    success(currentUser);
                }, function (response) {
                    error(response);
                });
        },
        signout: function (success) {
            Backend.logout(function () {
                currentUser  = defaultUser;
                nameDeferred = $q.defer();
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
        },
        remember: function () {
            $cookies.uid = currentUser.id;
        }
    };
});
