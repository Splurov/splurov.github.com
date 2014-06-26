(function() {

    'use strict';

    var isIos = !!navigator.userAgent.match(/(?:iPad|iPhone|iPod)/i);
    window.mkIsMobile = isIos || (!!navigator.userAgent.match(/(?:Android|IEMobile)/i));

    if (isIos) {
        document.documentElement.classList.add('ios');
    }
    document.documentElement.classList.add((window.mkIsMobile ? 'mobile' : 'not-mobile'));

    window.mkIsSmallScreen = window.matchMedia('(max-width: 640px)').matches;

}());
