'use strict';

/**
 * Cache my user data
 */
BioASQ.Me = function (MeRes) {
    this.MeRes = MeRes;
    this.data = null;
};

BioASQ.Me.prototype.login = function (callback) {
    var self = this;

    if(this.data == null){
        this._login(function(data){
            self.data = data;
            callback(data);
        });
    }else{
       callback(this.data);
    }
};

BioASQ.Me.prototype._login = function (callback) {
    this.MeRes.login(
        function (data, headers) {
            callback(data[0]);
        },
        function (response) {
            callback(null);
        });
};

BioASQ.service('Me', BioASQ.Me);
