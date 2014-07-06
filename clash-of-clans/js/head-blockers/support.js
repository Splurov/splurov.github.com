(function() {

    'use strict';

    var support = {
        'mobile': !!navigator.userAgent.match(/(?:Android|IEMobile|iPad|iPhone|iPod)/i),
        'touch': ('ontouchstart' in window)
    };

    Object.keys(support).forEach(function(key) {
        document.documentElement.classList.add((support[key] ? 's-' + key : 'ns-' + key));
    });

    window.mkSupport = support;

}());
