'use strict';

angular.module('bioasq.services').factory('Auth', function ($q, $cookies, $window, Backend, User) {
    var defaultUser     = { id: '' },
        currentUser     = { id: $cookies.uid || defaultUser.id },
        nameDeferred    = $q.defer(),
        currentInterval = null;

    function setRefreshInterval(cookies) {
        var matches = cookies.match(/exp=([0-9]+)/);
        if (matches.length < 2) { return; }
        var timeout = parseInt(matches[1], 10);
        // request a little bit earlier
        if (timeout > 20000) { timeout -= 10000; }
        currentInterval = $window.setInterval(function () {
            Backend.refresh({}, function (result, getHeader) {
            }, function (response) {
                $window.clearInterval(currentInterval);
            });
        }, timeout);
    }

    if (!!currentUser.id) {
        User.get({ id: currentUser.id }, function (user) {
            currentUser = user;
            nameDeferred.resolve([ user.first_name, user.last_name ].join(' '));
            setRefreshInterval($window.document.cookie);
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
                    setRefreshInterval($window.document.cookie);
                    success(currentUser);
                }, function (response) {
                    error(response);
                });
        },
        signout: function (success) {
            Backend.logout(function () {
                currentUser  = defaultUser;
                nameDeferred = $q.defer();
                $window.clearInterval(currentInterval);
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
