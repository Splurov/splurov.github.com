(function() {

    'use strict';

    if (!window.platformIos) {
        return;
    }

    var wrapper = document.querySelector('.js-add-to-home-screen');
    document.querySelector('.js-add-to-home-screen-button').addEventListener('touchend', function() {
        if (wrapper.dataset.on === 'true') {
            wrapper.dataset.on = 'false';
        } else {
            wrapper.dataset.on = 'true';
        }
    }, false);

}());
