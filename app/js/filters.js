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

filterModule.filter('idlinky', ['$sanitize', function($sanitize) {
        var ID_REGEXP = /[0-9a-f]{24}/,
            PATH = '#!/questions/';

        return function(text, target) {
            if (!text) return text;
            var match;
            var raw = text;
            var html = [];
            var url;
            var i;

            function addText(text) {
                if (!text) {
                    return;
                }
                html.push(sanitizeText(text));
            }

            function addLink(url, text) {
                html.push('<a ');
                if (angular.isDefined(target)) {
                    html.push('target="');
                    html.push(target);
                    html.push('" ');
                }
                html.push('href="');
                html.push(url);
                html.push('">');
                addText(text);
                html.push('</a>');
            }

            while ((match = raw.match(ID_REGEXP))) {
                text = match[0];
                i = match.index;
                addText(raw.substr(0, i));
                addLink(PATH + text, text);
                raw = raw.substring(i + text.length);
            }
            addText(raw);
            var rtn = $sanitize(html.join(''));
            return rtn;

            /**
             * angular-sanitize.js  1.2.9
             **/
            function sanitizeText(chars) {
                var buf = [];
                var writer = htmlSanitizeWriter(buf, angular.noop);
                writer.chars(chars);
                return buf.join('');
            }
            /**
             * angular-sanitize.js  1.2.9
             *
             * create an HTML/XML writer which writes to buffer
             * @param {Array} buf use buf.jain('') to get out sanitized html string
             * @returns {object} in the form of {
             *     start: function(tag, attrs, unary) {},
             *     end: function(tag) {},
             *     chars: function(text) {},
             *     comment: function(text) {}
             * }
             */
            function htmlSanitizeWriter(buf, uriValidator) {
                var ignore = false;
                var out = angular.bind(buf, buf.push);
                return {
                    start: function(tag, attrs, unary) {
                        tag = angular.lowercase(tag);
                        if (!ignore && specialElements[tag]) {
                            ignore = tag;
                        }
                        if (!ignore && validElements[tag] === true) {
                            out('<');
                            out(tag);
                            angular.forEach(attrs, function(value, key) {
                                var lkey = angular.lowercase(key);
                                var isImage = (tag === 'img' && lkey === 'src') || (lkey === 'background');
                                if (validAttrs[lkey] === true && (uriAttrs[lkey] !== true || uriValidator(value, isImage))) {
                                    out(' ');
                                    out(key);
                                    out('="');
                                    out(value);
                                    out('"');
                                }
                            });
                            out(unary ? '/>' : '>');
                        }
                    },
                    end: function(tag) {
                        tag = angular.lowercase(tag);
                        if (!ignore && validElements[tag] === true) {
                            out('</');
                            out(tag);
                            out('>');
                        }
                        if (tag == ignore) {
                            ignore = false;
                        }
                    },
                    chars: function(chars) {
                        if (!ignore) {
                            out((chars));
                        }
                    }
                };
            }
        };
    }
]);
