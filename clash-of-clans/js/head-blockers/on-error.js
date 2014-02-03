(function() {

    'use strict';

    window.onerror = function(message, file, line) {

        ga(
            'send',
            'event',
            'Javascript Error',
            message,
            file + ':' + line + ' [' + navigator.userAgent + ']'
        );

        return false;
    };

}());
