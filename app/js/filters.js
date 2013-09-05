'use strict';

var filterModule = angular.module('bioasq.filters', []);

// Converts date into relative date
filterModule.filter('relativeDate', function () {
    return function (date) {
        return moment(date).fromNow();
    };
});

// Converts line breaks to <br> tags
filterModule.filter('newlines', function() {
    return function(input) {
        if (typeof(input) === 'string') {
            return input.replace(/\n/g, '<br>');
        }
        return input;
    };
});
