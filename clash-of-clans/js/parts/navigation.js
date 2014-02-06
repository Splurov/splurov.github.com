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

    if (!window.mkIsMobile) {
        var FIXED_TOP_PADDING = 12;
        var FIXED_BOTTOM_PADDING = 15;

        var menuEl = dom.id('menu');
        var menuHeight = menuEl.offsetHeight;
        globalScrollOffset += menuHeight + FIXED_TOP_PADDING + FIXED_BOTTOM_PADDING;
        dom.id('menu-wrapper').style.height = menuHeight + 'px';

        var menuTop = getTopPosition(menuEl) - FIXED_TOP_PADDING;
        var isFixed = false;
        dom.listen(window, 'scroll', function() {
            var offset = window.pageYOffset;
            if (offset > menuTop) {
                if (!isFixed) {
                    menuEl.classList.add('button-group_menu-fixed');
                    isFixed = true;
                }
            } else if (isFixed) {
                menuEl.classList.remove('button-group_menu-fixed');
                isFixed = false;
            }
        });
    }

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
        e.preventDefault();
        smoothScroll(dom.id(e.currentTarget.getAttribute('data-for')));
    });

    return {
        'scrollTo': smoothScroll
    };

});
