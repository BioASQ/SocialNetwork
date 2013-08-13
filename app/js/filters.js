'use strict';

// gets date from now
BioASQ.filter('dateDiff', function () {
    return function (/*String*/prefix, /*ISO 8601*/date) {
        return prefix + moment(date).fromNow();
    };
});

//replacing &, <, >, ", ', and /
BioASQ.filter('escapeHTML', function () {
    return function (/*String*/plain) {
        var res = '';
        if(typeof(plain) === 'string'){
            res = plain.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g,'&quot;').replace(/\'/g,'&#x27;').replace(/\//g,'&#x2F;');
        }
        return res;
    };
});

// replacing \n to line breaks
BioASQ.filter('escapeLineBreaks', function () {
    return function (/*String*/plain) {
        var res = '';
        if(typeof(plain) === 'string'){
            res = plain.replace(/\n/g, '<br>');
        }
        return res;
    };
});

// uses escapeHTML and escapeLineBreaks filter
BioASQ.filter('parseContent', function ($filter) {
    return function (/*String*/plain) {
        return $filter('escapeLineBreaks')(
                    $filter('escapeHTML')(
                            plain
                    )
                );
    };
});