(function(){
    'use strict';

    var body = document.getElementsByTagName('body')[0];
    var button = document.getElementById('view-changelog');
    var overlay = document.getElementById('changelog-overlay');
    var popup = document.getElementById('changelog-popup');
    var close = document.getElementById('changelog-close');

    var showChangelog = function(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        body.style.overflow = 'hidden';
        overlay.className = overlay.className.replace(/\bhidden\b/, '');
        body.className += ' changelog';
        if (navigator.userAgent.indexOf('iPhone') !== -1) {
            window.scrollTo(0, 0);
        }
    };

    var hideChangelog = function(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        body.className = body.className.replace(/\bchangelog\b/, '');
        overlay.className += ' hidden';
        body.style.overflow = 'auto';
    };

    document.addEventListener('touchmove', function(e) {
        if (overlay.className.indexOf('hidden') === -1) {
            e.preventDefault();
        }
    });
    popup.addEventListener('touchmove', function(e) {
        e.stopPropagation();
    });

    overlay.addEventListener('click', hideChangelog, false);
    overlay.addEventListener('touchend', hideChangelog, false);

    popup.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    popup.addEventListener('touchend', function(e) {
        e.stopPropagation();
    });

    document.addEventListener('keydown', function(e) {
        if (overlay.className.indexOf('hidden') === -1) {
            var code = e.keyCode || e.which;
            if (code === 27) {
                hideChangelog();
            }
        }
    }, false);

    close.addEventListener('click', hideChangelog, false);
    close.addEventListener('touchend', hideChangelog, false);

    button.addEventListener('click', showChangelog, false);
    button.addEventListener('touchend', showChangelog, false);

}());