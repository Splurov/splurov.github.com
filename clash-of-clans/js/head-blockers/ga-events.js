(function() {

    'use strict';

    if (navigator.userAgent.search(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i) !== -1) {
        ga(
            'send',
            'event',
            'Scale Ratio',
            (screen.width / window.innerWidth).toFixed(2),
            navigator.userAgent
        );
    }

}());