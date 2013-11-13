(function() {

    'use strict';

    if (window.device && window.device.cordova) {
        var clickHandler = function(e) {
            e.preventDefault();
            e.stopPropagation();
            app.open_browser(e.currentTarget.getAttribute('href'));
        };

        var links = document.getElementsByTagName('a');
        var i = -1;
        var l = links.length;
        while (++i < l) {
            links[i].removeAttribute('target');
            links[i].addEventListener('touchend', clickHandler);
        }
    }

}());
