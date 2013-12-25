(function() {

    'use strict';

    if (window.mkIsIos) {
        var wrapper = document.getElementById('add-to-home-screen');
        document.getElementById('add-to-home-screen-button').addEventListener('touchend', function() {
            if (wrapper.dataset.on === 'true') {
                wrapper.dataset.on = 'false';
            } else {
                wrapper.dataset.on = 'true';
            }
        }, false);
    }

}());
