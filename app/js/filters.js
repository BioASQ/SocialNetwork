'use strict';

/* usage:
 *
 * {{ 'created' | dateDiff:'2013-01-01T01:00:00.515Z':'2013-02-01T01:00:00.515Z' }}
 */
BioASQ.filter('dateDiff', function () {
    return function (/*String*/prefix, /*ISO 8601*/oldDate,/*ISO 8601*/ newDate) {

        //console.log('why is this filter is running 10 timesfor 1 call?');

        var dateDiff = function dateDiff( strA, strB ) {
            var d = Date.parse( strB ) - Date.parse( strA );
            return isNaN( d ) ? NaN : {
                diff : d,
                ms : Math.floor( d                   % 1000  ),
                s  : Math.floor( d /     1000        %   60  ),
                m  : Math.floor( d /     60000       %   60  ),
                h  : Math.floor( d /     3600000     %   24  ),
                d  : Math.floor( d /     86400000    %  365  ),
                y  : Math.floor( d /     31536000000         )
            };
        }

        var diff = dateDiff(oldDate,newDate);
        var diffLabel = '';
        if(diff.y > 0) {
           if(diff.d > (365/2)){
               diffLabel = diff.y + 1 + ' years ago';
           }else{
               diffLabel = diff.y + (diff.y > 1 ? ' years' : ' year') + ' ago';
           }
        } else if(diff.d > 0) {
            if(diff.h > (24/2)){
                diffLabel = diff.d + 1 + ' days ago';
            }else{
                diffLabel = diff.d + (diff.d > 1 ? ' days' : ' day') + ' ago';
            }
        }else if(diff.h > 0){
            if(diff.m > (60/2)){
                diffLabel = diff.h + 1 + ' hours ago';
            }else{
                diffLabel = diff.h + (diff.h > 1 ? ' hours' : ' hour') + ' ago';
            }
        }else if(diff.m > 0){
            if(diff.s > (60/2)){
                diffLabel = diff.m + 1 + ' minutes ago';
            }else{
                diffLabel = diff.m + (diff.m > 1 ? ' minutes' : ' minute') + ' ago';
            }
        }else {
            diffLabel = ' just now';
        }
        return prefix + ' ' +  diffLabel;
    };
});

BioASQ.filter('parseContent', function () {
    return function (/*String*/plain) {
        // parse html
        plain = plain.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        // parse line breaks
        return plain.replace(/\n/g, '<br>');
    };
});