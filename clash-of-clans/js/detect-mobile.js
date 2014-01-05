(function() {
    'use strict';

    var ios = !!navigator.userAgent.match(/(?:iPad|iPhone|iPod)/i);
    window.mkIsMobile = ios || (!!navigator.userAgent.match(/(?:Android|IEMobile)/i));

    document.documentElement.classList.add((window.mkIsMobile ? 'mobile' : 'not-mobile'));

    if (ios) {
        document.documentElement.classList.add('ios');
    }

}());
