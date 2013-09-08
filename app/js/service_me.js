'use strict';

var MeService = function (Activity, Me) {
    this.Activity = Activity;
    this.Me = Me;
    this.user  = {
        data: null,
        followings: null
    };
};

MeService.prototype.login = function (input, okCb, errorCb) {
    if (this.user.data === null) {
        var self = this;
        this._login(input,
            function (data) {
                okCb(self.user);
            },
            function (response){
                errorCb(response);
            }
        );
    } else {
        callback(this.data.user);
    }
};

MeService.prototype._login = function (input, okCb, errorCb) {
    var self = this;
    this.Me.login(input,
        function (user, headers) {
            self.user.data = user;
            self.Activity.following({ id: user.id }, function (result) {
                self.user.followings = result.map(function (f) {
                    return f.about;
                });
                okCb(self.user);
            });
        },
        function(response) {
            self.user.data = null;
            self.user.followings = null;
            errorCb(response);
        }
    );
};

angular.module('bioasq.services').service('MeService', MeService);
