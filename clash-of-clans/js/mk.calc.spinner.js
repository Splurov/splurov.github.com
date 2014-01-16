part(['events', 'dom'], function(events, dom) {

    'use strict';

    var spinnerAction = function(targetElement, type) {
        var current = parseInt(targetElement.value, 10);
        if (type === '+') {
            if (isNaN(current)) {
                targetElement.value = 1;
            } else {
                targetElement.value = current + 1;
            }
        } else {
            if (isNaN(current) || current < 2) {
                targetElement.value = '';
            } else {
                targetElement.value = current - 1;
            }
        }
        events.trigger('calculate', {
            'type': targetElement.getAttribute('data-type')
        });
    };

    var currentSpinner = {
        'target': null,
        'click': false,
        'firstTimeout': null,
        'secondTimeout': null,
        'x': 0,
        'y': 0
    };

    var spinnerEventStart = function(target) {
        currentSpinner.target = target;
        currentSpinner.click = true;
        currentSpinner.firstTimeout = setTimeout(function() {
            currentSpinner.click = false;
            (function fakeInterval() {
                currentSpinner.secondTimeout = setTimeout(function() {
                    spinnerAction(currentSpinner.target.spinnerTarget, currentSpinner.target.textContent);
                    fakeInterval();
                }, 100);
            }());
        }, 500);
    };

    var spinnerEventMoveStop = function(diffX, diffY) {
        if (diffX > 10 || diffY > 10) {
            currentSpinner.target = null;
            currentSpinner.click = false;
            clearTimeout(currentSpinner.firstTimeout);
            clearTimeout(currentSpinner.secondTimeout);
        }
    };

    var spinnerEventStop = function() {
        if (currentSpinner.target) {
            if (currentSpinner.click) {
                spinnerAction(currentSpinner.target.spinnerTarget, currentSpinner.target.textContent);
            }
            currentSpinner.target = null;
            clearTimeout(currentSpinner.firstTimeout);
            clearTimeout(currentSpinner.secondTimeout);
        }
    };

    var touchSupported = ('ontouchstart' in window);

    if (!window.mkIsMobile || !touchSupported) {
        window.addEventListener('mousemove', function(e) {
            if (currentSpinner.target) {
                var diffX = Math.abs(e.screenX - currentSpinner.x);
                var diffY = Math.abs(e.screenY - currentSpinner.y);
                spinnerEventMoveStop(diffX, diffY);
            }
        }, false);

        window.addEventListener('mouseup', function() {
            spinnerEventStop();
        }, false);
    }

    var spinnerEvents = function(el) {

        if (touchSupported) {
            var preventTimeStamp = 0;
            el.addEventListener('touchstart', function(e) {
                e.stopPropagation();

                if (e.timeStamp - preventTimeStamp < 500) {
                    e.preventDefault();
                }
                preventTimeStamp = e.timeStamp;

                currentSpinner.x = e.touches[0].screenX;
                currentSpinner.y = e.touches[0].screenY;

                spinnerEventStart(e.currentTarget);
            }, false);

            el.addEventListener('touchmove', function(e) {
                e.stopPropagation();

                if (currentSpinner.target) {
                    var diffX = Math.abs(e.touches[0].screenX - currentSpinner.x) / 2;
                    var diffY = Math.abs(e.touches[0].screenY - currentSpinner.y) / 2;
                    spinnerEventMoveStop(diffX, diffY);
                }
            }, false);

            el.addEventListener('touchcancel', function(e) {
                e.stopPropagation();
                spinnerEventStop();
            }, false);

            el.addEventListener('touchend', function(e) {
                e.stopPropagation();
                spinnerEventStop();
            }, false);
        }

        if (!window.mkIsMobile || !touchSupported) {
            el.addEventListener('mousedown', function(e) {
                e.stopPropagation();

                currentSpinner.x = e.screenX;
                currentSpinner.y = e.screenY;
                spinnerEventStart(e.currentTarget);
            }, false);
        }

    };

    var setSpinner = function(type, el) {
        var container = document.createElement('button');
        container.className = 'button button_spinner';
        container.textContent = (type === 'plus' ? '+' : '−');
        container.spinnerTarget = el;

        spinnerEvents(container);

        dom.insertBefore(el, container);
    };

    var spinnerKeyboard = function(e) {
        var code = e.keyCode || e.which;
        if (code === 38) {
            spinnerAction(e.currentTarget, '+');
            e.preventDefault();
        } else if (code === 40) {
            spinnerAction(e.currentTarget, '-');
            e.preventDefault();
        }
    };

    dom.find('.js-number').iterate(function(el) {
        dom.selectOnFocus(el);
        setSpinner('minus', el);
        setSpinner('plus', el);

        dom.listen(el, ['keydown'], spinnerKeyboard);
    });

});