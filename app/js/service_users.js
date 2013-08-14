'use strict';

/**
 * Users service
 */
BioASQ.Users = function(UserRes, CommentsRes, FollowersRes, FollowingRes, FollowRes) {
    this.UserRes = UserRes;
    this.CommentsRes = CommentsRes;
    this.FollowersRes = FollowersRes;
    this.FollowingRes = FollowingRes;
    this.FollowRes = FollowRes;
};

BioASQ.Users.prototype.getUser = function(id, callback) {
    this.UserRes.get({
        id: id

    }, function(data, headers) {
        callback(data);

    }, function(response) {
        callback(null);
    });
};

BioASQ.Users.prototype.getComments = function(id, callback) {
    this.CommentsRes.get({
        id: id

    }, function(data, headers) {
        callback(data);

    }, function(response) {
        callback(null);
    });
};

BioASQ.Users.prototype.getFollowers = function(id, callback) {
    this.FollowersRes.get({
        id: id

    }, function(data, headers) {
        callback(data);

    }, function(response) {
        callback(null);
    });
};

BioASQ.Users.prototype.getFollowing = function(id, callback) {
    this.FollowingRes.get({
        id: id

    }, function(data, headers) {
        callback(data);

    }, function(response) {
        callback(null);
    });
};

BioASQ.Users.prototype.follow = function(me, id, callback) {
    this.FollowRes.follow({
        who: me,
        id: id

    }, function(data, headers) {
        callback(data);

    }, function(response) {
        callback(null);
    });
};

BioASQ.Users.prototype.getFollowingIds = function(id, callback) {
    this.getFollowing(id, function(data) {
        var ids = [];
        angular.forEach(data, function(v, k) {
            ids.push(v.id);
        });
        callback(ids);
    });
};

BioASQ.service('Users', BioASQ.Users);
