(function() {

    'use strict';

    if (navigator.userAgent.search(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i) !== -1) {
        ga(
            'send',
            'event',
            'Scale Ratio',
            Math.round(screen.width / window.innerWidth, 2),
            navigator.userAgent
        );
    }

}());