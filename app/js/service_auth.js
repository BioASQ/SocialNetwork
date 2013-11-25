'use strict';

angular.module('bioasq.services').factory('Auth', function ($q, $cookies, $window, Backend, User) {
    var defaultUser     = { id: '' },
        currentUser     = { id: $cookies.uid || defaultUser.id },
        nameDeferred    = $q.defer(),
        currentInterval = null;

    function setRefreshInterval(interval, serverDate) {
        if (serverDate) {
            // if this is negative, the server is behind
            var diff = Date.now() - Date.parse(serverDate);
            interval = Math.max(interval - diff - 500, 10000);
        }
        $window.clearInterval(currentInterval);
        $cookies.expiry = String(Date.now() + interval);
        currentInterval = $window.setInterval(function () {
            Backend.refresh({}, function (result, getHeader) {
                var matches = $window.document.cookie.match(/exp=([0-9]+)/);
                if (matches) {
                    setRefreshInterval(parseInt(matches[1], 10), getHeader('Date'));
                }
            }, function (response) {
                $window.clearInterval(currentInterval);
            });
        }, interval);
    }

    if (!!currentUser.id) {
        User.get({ id: currentUser.id }, function (user) {
            currentUser = user;
            nameDeferred.resolve([ user.first_name, user.last_name ].join(' '));
            setRefreshInterval(parseInt($cookies.expiry, 10) - Date.now());
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
                function (user, headers) {
                    currentUser = user;
                    nameDeferred.resolve([ user.first_name, user.last_name ].join(' '));
                    var matches = $window.document.cookie.match(/exp=([0-9]+)/);
                    if (matches) {
                        setRefreshInterval(parseInt(matches[1], 10), headers('Date'));
                    }
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
                delete $cookies.expiry;
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
