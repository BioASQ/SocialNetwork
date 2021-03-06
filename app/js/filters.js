'use strict';

var filterModule = angular.module('bioasq.filters', []);

// Converts date into relative date
filterModule.filter('relativeDate', function() {
    return function(date) {
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

// Converts a URI or literal string to an RDF node in
// Turtle notation.
filterModule.filter('rdf', function() {
    return function(term) {
        if (term.search(/^(https?|mailto|tel|urn):/) === 0) {
            return ['<', term, '>'].join('');
        } else if (term.charAt(0) === '_') {
            return term;
        }
        // return '"'.concat(term).concat('"');
        // return '"' + term + '"';
        return ['"', term, '"'].join('');
    };
});

// Extracts a profile ID from a Gravatar image request URI.
filterModule.filter('gravatar', function() {
    return function(URL) {
        var m = URL.match(/[0-9a-fA-F]{32}/);
        if (m.length) {
            return m[0];
        }
        return '';
    };
});

// Converts question IDs to links.
filterModule.filter('idlinky', function() {
    return function(text, target) {
        if (!text || typeof(text) !== 'string') {
            return text;
        }

        var ID_REGEXP = /[0-9a-f]{24}/,
            PATH = '#!/questions/',
            raw = text,
            match,
            i,
            html = [];

        while ((match = raw.match(ID_REGEXP))) {
            text = match[0];
            i = match.index;
            html.push(raw.substr(0, i));

            html.push('<a ');
            if (angular.isDefined(target)) {
                html.push('target="');
                html.push(target);
                html.push('" ');
            }
            html.push('href="');
            html.push(PATH);
            html.push(text);
            html.push('">');
            html.push(text);
            html.push('</a>');

            raw = raw.substring(i + text.length);
        }
        html.push(raw);

        return html.join('');
    };
});

// Converts a number and a given activity (questions, votes, comments) to html rewards.
filterModule.filter('rewards', function() {
    var defaultLabel = 'greenhorn',
        commentsMap = {
            beginner: { label: 'beginner', threshold: 1},
            advanced: { label: 'advanced', threshold: 10},
            expert:   { label: 'expert',   threshold: 100}
        },
        votesMap = {
            beginner: { label: 'beginner', threshold: 1},
            advanced: { label: 'advanced', threshold: 10},
            expert:   { label: 'expert',   threshold: 100}
        },
        questionsMap = {
            beginner: { label: 'beginner', threshold: 1},
            advanced: { label: 'advanced', threshold: 10},
            expert:   { label: 'expert',   threshold: 100}
        };
    // css classes
    var greenhorn = 'greenhorn',
        beginner  = 'beginner',
        advanced  = 'advanced',
        expert    = 'expert';
    var tier = function(num, activity, map) {
        var html = [];
        html.push('<span class="label" title="');
        html.push(num);
        html.push('"><span class="');

        var css = greenhorn;
        var title = defaultLabel;
        if (num >= map.expert.threshold) {
            css = expert;
            title = map.expert.label;
        }else if (num >= map.advanced.threshold) {
            css = advanced;
            title = map.advanced.label;
        } else if (num >= map.beginner.threshold) {
            css = beginner;
            title = map.beginner.label;
        }
        html.push(css);
        html.push('">&#9733;</span>&nbsp;');
        //html.push(title);
        //html.push(' ');
        html.push(activity);
        html.push('</span>');

        return html.join('');
    };

    return function(num, activity) {
        if (activity === 'questions') {
            return tier(num, activity, questionsMap);
        } else if (activity === 'votes') {
            return tier(num, activity, votesMap);
        } else if (activity === 'comments') {
            return tier(num, activity, commentsMap);
        } else {
            return '';
        }
    };
});
