part([
    'dom'
], function(dom) {
    'use strict';

    var BASE_CLASS = 'help-tooltip';

    var VISIBLE_CLASS = BASE_CLASS + '_visible';
    var RIGHT_CLASS = BASE_CLASS + '_right';

    var HIDDEN_POSITION = '-999px';

    var X_OFFSET = 15;
    var Y_OFFSET = 7;

    var el;
    var isInitialized = false;
    var hideTimeout;

    var initialize = function() {
        el = document.createElement('div');
        el.classList.add(BASE_CLASS);
        el.style.left = HIDDEN_POSITION;
        document.body.appendChild(el);

        dom.listen(el, 'transitionend', function() {
            if (!el.classList.contains(VISIBLE_CLASS)) {
                el.style.left = HIDDEN_POSITION;
            }
        });

        var isHide;
        dom.listen(window, 'touchstart', function(e) {
            isHide = (e.target !== el);
            if (isHide && el.classList.contains(VISIBLE_CLASS)) {
                hideTimeout = setTimeout(function() {
                    el.classList.remove(VISIBLE_CLASS);
                }, 300);
            }
        });
        dom.listen(window, 'touchmove', function() {
            isHide = false;
        });
        dom.listen(window, 'touchend', function() {
            clearTimeout(hideTimeout);
            if (isHide) {
                el.classList.remove(VISIBLE_CLASS);
            }
        });

        ['mousedown', 'resize'].forEach(function(eventName) {
            dom.listen(window, eventName, function(e) {
                if (e.target !== el) {
                    el.classList.remove(VISIBLE_CLASS);
                }
            });
        });
    };

    dom.find('.js-help-link').listen('universalClick', function(e) {
        e.stopPropagation();

        if (!isInitialized) {
            initialize();
            isInitialized = true;
        }

        clearTimeout(hideTimeout);

        var linkEl = e.currentTarget;

        el.style.left = HIDDEN_POSITION;
        el.innerHTML = linkEl.querySelector('.js-help-content').innerHTML;

        var width = el.offsetWidth;
        var scrollLeft = window.scrollX;
        var windowWidth = window.innerWidth;
        var elPosition = dom.getPosition(linkEl);

        var left = elPosition.left - X_OFFSET;
        if ((left + width) > (scrollLeft + windowWidth) && (windowWidth / 2) < (left - scrollLeft)) {
            left = elPosition.left - width + linkEl.offsetWidth + X_OFFSET;
            el.classList.add(RIGHT_CLASS);
        } else {
            el.classList.remove(RIGHT_CLASS);
        }

        el.style.top = (elPosition.top + linkEl.offsetHeight + Y_OFFSET) + 'px';
        el.style.left = left + 'px';
        el.classList.add(VISIBLE_CLASS);
    });

});
