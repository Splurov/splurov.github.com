(function() {

    'use strict';

    window.onerror = function(message, file, line) {

        // https://developers.google.com/analytics/devguides/collection/analyticsjs/events
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
