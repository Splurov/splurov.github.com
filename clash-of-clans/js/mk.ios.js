(function() {

    'use strict';

    if (window.device && window.device.cordova) {
        var clickHandler = function(e) {
            e.preventDefault();
            e.stopPropagation();
            app.open_browser(e.currentTarget.getAttribute('href'));
        };

        var links = document.getElementsByTagName('a');
        var l = links.length;
        while (l--) {
            links[l].removeAttribute('target');
            links[l].addEventListener('touchend', clickHandler);
        }
    }

}());
