(function() {

    'use strict';

    if (window.mkIsIos) {
        ga(
            'send',
            'event',
            'Possible Disable',
            ((navigator.userAgent.indexOf('Safari/') === -1) ? 'Yes' : 'No'),
            [(screen.width / window.innerWidth).toFixed(2), navigator.userAgent].join(' / ')
        );
    }

}());