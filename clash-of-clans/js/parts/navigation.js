part('navigation', [
    'dom',
    'goal'
], function(dom, goal){

    'use strict';

    var globalScrollOffset = parseInt(window.getComputedStyle(document.body).getPropertyValue('padding-top'), 10);

    var smoothScroll = function(el, callback) {
        var currentScrollTop = window.pageYOffset;
        var elScrollTop = Math.max(dom.getPosition(el).top - globalScrollOffset, 0);

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
        e.preventDefault();
        var id = e.currentTarget.getAttribute('data-for');
        smoothScroll(dom.id(id));
        goal.reach('ANCHOR_CLICKED', {
            'anchorFor': id
        });
    });

    return {
        'scrollTo': smoothScroll
    };

});
