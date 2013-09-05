'use strict';

var Me = function (MeRes) {
    this.MeRes = MeRes;
    this.data = null;
};

Me.prototype.login = function(callback) {
    var self = this;

    if (this.data === null) {
        this._login(function(data) {
            self.data = data;
            callback(data);
        });
    } else {
        callback(this.data);
    }
};

Me.prototype._login = function(callback) {
    this.MeRes.login(
        function(data, headers) {
            callback(data);
        },
        function(response) {
            callback(null);
        });
};

angular.module('bioasq.services').service('Me', Me);
