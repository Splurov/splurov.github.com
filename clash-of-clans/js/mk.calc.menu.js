(function(mk){

    'use strict';

    var menuWrapperEl = document.querySelector('.js-menu-wrapper');
    var menuEl = document.querySelector('.js-menu');
    var menuTopPosition = mk.getTopPosition(menuEl);

    var menuElHeight = menuEl.offsetHeight;
    menuWrapperEl.style.height = menuElHeight + 'px';

    var globalScrollOffset = 15;

    var isFixed = false;

    if (!window.platformIos) {
        globalScrollOffset += menuElHeight;

        document.addEventListener('scroll', function() {
            if (window.pageYOffset >= menuTopPosition) {
                if (!isFixed) {
                    menuEl.className += ' menu_fixed ';
                    isFixed = true;
                }
            } else if (isFixed) {
                isFixed = false;
                menuEl.className = menuEl.className.replace(' menu_fixed ', '');
            }
        }, false);
    }

    var smoothScroll = function(el) {
        var currentScrollTop = window.pageYOffset;
        var elScrollTop = mk.getTopPosition(el) - globalScrollOffset;

        var toTop = (elScrollTop < currentScrollTop);
        var diff = (toTop ? (currentScrollTop - elScrollTop) : (elScrollTop - currentScrollTop));

        var duration = 100 + (diff / 20);
        var delay = 16;
        var step = Math.round(diff / (duration / delay));

        var interval = setInterval(function() {
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

            if (currentScrollTop === elScrollTop) {
                clearInterval(interval);
            }
        }, delay);
    };

    mk.Events.listen('scrollTo', smoothScroll);

    var goToAnchor = function(e) {
        e.preventDefault();
        e.stopPropagation();
        smoothScroll(document.getElementById(e.currentTarget.getAttribute('data-anchor-target')));
    };

    mk.getAllByClass('js-anchor').forEach(function(el) {
        mk.addEvents(el, ['click', 'touchend'], goToAnchor);
    });

}(window.mk));