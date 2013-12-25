(function() {
    'use strict';

    window.mkIsIos = !!navigator.userAgent.match(/(?:iPad|iPhone|iPod)/i);
    var otherMobile = !!navigator.userAgent.match(/(?:Android|IEMobile)/i);
    window.mkIsMobile = window.mkIsIos || otherMobile;

    var specialClass;
    if (window.mkIsMobile) {
        specialClass = 'mobile';
    } else {
        specialClass = 'not-mobile';
    }
    document.documentElement.classList.add(specialClass);

    if (window.mkIsIos) {
        document.documentElement.classList.add('ios');
    }

}());
