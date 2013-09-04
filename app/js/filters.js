'use strict';

var filterModule = angular.module('bioasq.filter', []);

// Converts date into relative date
filterModule.filter('relativeDate', function () {
    return function (date) {
        return moment(date).fromNow();
    };
});

// Capitalizes the first letter
filterModule.filter('capitalize', function () {
    return function (str) {
        return str[0].toUpperCase() + str.slice(1);
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
