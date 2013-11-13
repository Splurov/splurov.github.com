(function(){

    'use strict';

    var getTopPosition = function(el) {
        var position = 0;
        do {
            position += el.offsetTop;
        } while (el = el.offsetParent);

        return position;
    };

    var menuWrapperEl = mk.$id('menu-wrapper');
    var menuEl = mk.$id('menu');
    var menuTopPosition = getTopPosition(menuEl);

    var menuElHeight = menuEl.offsetHeight;
    menuWrapperEl.style.height = menuElHeight + 'px';

    var globalScrollOffset = 15;

    if (!window.platformIos) {
        globalScrollOffset += menuElHeight;

        document.addEventListener('scroll', function() {
            if (window.pageYOffset >= menuTopPosition) {
                menuEl.classList.add('menu_fixed');
            } else {
                menuEl.classList.remove('menu_fixed');
            }
        }, false);
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

    mk.Events.listen('scrollTo', smoothScroll);

    mk.$('.js-anchor').iterate(function(el) {
        mk.$Listen(el, ['click'], smoothScroll.bind(null, mk.$id(el.getAttribute('data-anchor-target'))));
    });

}());