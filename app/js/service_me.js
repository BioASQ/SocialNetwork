'use strict';

var Me = function (MeRes) {
    this.MeRes = MeRes;
    this.data  = null;
};

Me.prototype.login = function (login, password, callback) {
    var self = this;

    if (this.data === null) {
        this._login(login, password, function (data) {
            self.data = data;
            callback(data);
        });
    } else {
        callback(this.data);
    }
};

Me.prototype._login = function (login, password, callback) {
    this.MeRes.login({}, { id: login, password: password },
        function (data, headers) {
            callback(data);
        },
        function (response) {
            callback(null);
        });
};

angular.module('bioasq.services').service('Me', Me);
