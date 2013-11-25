'use strict';

var filterModule = angular.module('bioasq.filters', []);

// Converts date into relative date
filterModule.filter('relativeDate', function () {
    return function (date) {
        return moment(date).fromNow();
    };
});

// Converts line breaks to <br> tags
filterModule.filter('newlines', function () {
    return function (input) {
        if (typeof(input) === 'string') {
            return input.replace(/\n/g, '<br>');
        }
        return input;
    };
});

// Converts a URI or literal string to an RDF node in
// Turtle notation.
filterModule.filter('rdf', function () {
    return function (term) {
        if (term.search(/^(https?|mailto|tel|urn):/) === 0) {
            return [ '<', term, '>' ].join('');
        } else if (term.charAt(0) === '_') {
            return term;
        }
        // return '"'.concat(term).concat('"');
        // return '"' + term + '"';
        return [ '"', term, '"' ].join('');
    };
});

// Extracts a profile ID from a Gravatar image request URI.
filterModule.filter('gravatar', function () {
    return function (URL) {
        var m = URL.match(/[0-9a-fA-F]{32}/);
        if (m.length) {
            return m[0];
        }
        return '';
    };
});
