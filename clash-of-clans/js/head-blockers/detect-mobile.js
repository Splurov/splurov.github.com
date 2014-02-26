(function() {

    'use strict';

    window.mkIsIos = !!navigator.userAgent.match(/(?:iPad|iPhone|iPod)/i);
    window.mkIsMobile = window.mkIsIos || (!!navigator.userAgent.match(/(?:Android|IEMobile)/i));

    document.documentElement.classList.add((window.mkIsIos ? 'ios' : 'not-ios'));
    document.documentElement.classList.add((window.mkIsMobile ? 'mobile' : 'not-mobile'));

}());
