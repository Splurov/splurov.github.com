part(['events', 'dom'], function(events, dom){

    'use strict';

    var getTopPosition = function(el) {
        var position = 0;
        do {
            position += el.offsetTop;
        } while (el = el.offsetParent);

        return position;
    };

    var menuWrapperEl = dom.id('menu-wrapper');
    var menuEl = dom.id('menu');
    var menuTopPosition = getTopPosition(menuEl);

    var menuElHeight = menuEl.offsetHeight;
    menuWrapperEl.style.height = menuElHeight + 'px';

    var globalScrollOffset = 15;

    if (!window.mkIsMobile) {
        globalScrollOffset += menuElHeight;

        dom.listen(window, ['scroll'], function() {
            dom.toggleClass(menuEl, 'menu_fixed', (window.pageYOffset >= menuTopPosition));
        });
    }

    var smoothScroll = function(el) {
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
                }
            }, delay);
        }());
    };

    events.listen('scrollTo', smoothScroll);

    dom.find('.js-anchor').listen(['universalClick'], function(e) {
        smoothScroll(dom.id(e.currentTarget.getAttribute('data-for')));
    });

});
