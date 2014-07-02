part('navigation', [
    'dom'
], function(dom){

    'use strict';

    var globalScrollOffset = 15;

    if (!window.mkIsSmallScreen) {
        var FIXED_TOP_PADDING = 12;
        var FIXED_BOTTOM_PADDING = 15;

        var menuEl = dom.id('menu');
        var menuHeight = menuEl.offsetHeight;
        globalScrollOffset += menuHeight + FIXED_TOP_PADDING + FIXED_BOTTOM_PADDING;
        dom.id('menu-wrapper').style.height = menuHeight + 'px';

        var menuTop = dom.getPosition(menuEl).top - FIXED_TOP_PADDING;
        var isFixed = false;

        var moveMenu = function() {
            var offset = window.pageYOffset;
            if (offset > menuTop) {
                if (!isFixed) {
                    menuEl.classList.add('menu_fixed');
                    isFixed = true;
                }
            } else if (isFixed) {
                menuEl.classList.remove('menu_fixed');
                isFixed = false;
            }
        };

        dom.listen(window, 'scroll', moveMenu);

        moveMenu();
    }

    var smoothScroll = function(el, callback) {
        var currentScrollTop = window.pageYOffset;
        var elScrollTop = dom.getPosition(el).top - globalScrollOffset;

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
        smoothScroll(dom.id(e.currentTarget.getAttribute('data-for')));
    });

    return {
        'scrollTo': smoothScroll
    };

});
