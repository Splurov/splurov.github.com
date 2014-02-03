part('navigation', [
    'dom'
], function(dom){

    'use strict';

    var getTopPosition = function(el) {
        var position = 0;
        do {
            position += el.offsetTop;
        } while (el = el.offsetParent);

        return position;
    };

    var globalScrollOffset = 15;

    var smoothScroll = function(el, callback) {
        var currentScrollTop = window.pageYOffset;
        var elScrollTop = getTopPosition(el) - globalScrollOffset;

        var toTop = (elScrollTop < currentScrollTop);
        var diff = (toTop ? (currentScrollTop - elScrollTop) : (elScrollTop - currentScrollTop));

        var duration = 100 + (diff / 20);
        var delay = 16;
        var step = Math.round(diff / (duration / delay));

        (function scrollIteration() {
            setTimeout(function() {
                if (toTop) {
                    currentScrollTop -= step;
                    if (currentScrollTop < elScrollTop) {
                        currentScrollTop = elScrollTop;
                    }
                } else {
                    currentScrollTop += step;
                    if (currentScrollTop > elScrollTop) {
                        currentScrollTop = elScrollTop;
                    }
                }

                window.scrollTo(window.pageXOffset, currentScrollTop);

                if (currentScrollTop !== elScrollTop) {
                    scrollIteration();
                } else if (callback) {
                    callback();
                }
            }, delay);
        }());
    };

    dom.find('.js-anchor').listen('universalClick', function(e) {
        smoothScroll(dom.id(e.currentTarget.getAttribute('data-for')));
    });

    return {
        'scrollTo': smoothScroll
    };

});
