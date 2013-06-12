(function(window, document, mk) {

    'use strict';

    if (window.device && window.device.cordova) {
        mk.toArray(document.getElementsByTagName('a')).forEach(function(el) {
            var href = el.getAttribute('href');
            el.removeAttribute('target');
            el.setAttribute('href', 'javascript:void(0)');
            el.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                app.open_browser(href);
            });
        });
    }

}(window, document, window.mk));
