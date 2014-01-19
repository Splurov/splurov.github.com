part(['events', 'dom'], function(events, dom) {

    'use strict';

    var elements = [];

    var spinnerAction = function(el, type) {
        var current = parseInt(el.value, 10);
        if (type === '+') {
            if (isNaN(current)) {
                el.value = 1;
            } else {
                el.value = ++current;
            }
        } else {
            if (isNaN(current) || current <= 1) {
                el.value = '';
            } else {
                el.value = --current;
            }
        }
        events.trigger('valueChange', {
            'el': el,
            'calculate': true
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

    var spinnerEventAction = function() {
        spinnerAction(elements[parseInt(currentSpinner.target.getAttribute('data-for'), 10)],
                      currentSpinner.target.textContent);
    };

    var spinnerEventStart = function(target) {
        currentSpinner.target = target;
        currentSpinner.click = true;
        currentSpinner.firstTimeout = setTimeout(function() {
            currentSpinner.click = false;
            (function fakeInterval() {
                currentSpinner.secondTimeout = setTimeout(function() {
                    spinnerEventAction();
                    fakeInterval();
                }, 100);
            }());
        }, 500);
    };

    var spinnerEventMoveStop = function(diffX, diffY) {
        if (diffX > 16 || diffY > 16) {
            currentSpinner.target = null;
            currentSpinner.click = false;
            clearTimeout(currentSpinner.firstTimeout);
            clearTimeout(currentSpinner.secondTimeout);
        }
    };

    var spinnerEventStop = function() {
        if (currentSpinner.target) {
            if (currentSpinner.click) {
                spinnerEventAction();
            }
            currentSpinner.target = null;
            clearTimeout(currentSpinner.firstTimeout);
            clearTimeout(currentSpinner.secondTimeout);
        }
    };

    var touchSupported = ('ontouchstart' in window);

    if (!window.mkIsMobile || !touchSupported) {
        dom.listen(document.body, 'mousedown', function(e) {
            if (e.target.classList.contains('js-spinner')) {
                currentSpinner.x = e.screenX;
                currentSpinner.y = e.screenY;
                spinnerEventStart(e.target);
            }
        });

        dom.listen(document.body, 'mousemove', function(e) {
            if (currentSpinner.target) {
                var diffX = Math.abs(e.screenX - currentSpinner.x);
                var diffY = Math.abs(e.screenY - currentSpinner.y);
                spinnerEventMoveStop(diffX, diffY);
            }
        });

        dom.listen(document.body, 'mouseup', function() {
            spinnerEventStop();
        });
    }

    if (touchSupported) {
        var preventTimeStamp = 0;
        dom.listen(document.body, 'touchstart', function(e) {
            if (e.target.classList.contains('js-spinner')) {
                if (e.timeStamp - preventTimeStamp < 500) {
                    e.preventDefault();
                }
                preventTimeStamp = e.timeStamp;

                currentSpinner.x = e.touches[0].screenX;
                currentSpinner.y = e.touches[0].screenY;

                spinnerEventStart(e.target);
            }
        });

        dom.listen(document.body, 'touchmove', function(e) {
            if (currentSpinner.target) {
                var diffX = Math.abs(e.touches[0].screenX - currentSpinner.x) / 2;
                var diffY = Math.abs(e.touches[0].screenY - currentSpinner.y) / 2;
                spinnerEventMoveStop(diffX, diffY);
            }
        });

        dom.listen(document.body, 'touchcancel', function() {
            spinnerEventStop();
        });

        dom.listen(document.body, 'touchend', function() {
            spinnerEventStop();
        });
    }

    dom.listen(document.body, 'keydown', function(e) {
        if (e.target.classList.contains('js-number') && !e.metaKey && !e.shiftKey && !e.ctrlKey && !e.altKey &&
                [38, 40].indexOf(e.keyCode) !== -1) {
            spinnerAction(e.target, (e.keyCode === 38 ? '+' : '-'));
            e.preventDefault();
        }
    });

    var setSpinner = function(type, el) {
        var container = document.createElement('button');
        container.className = 'button button_spinner js-spinner';
        container.textContent = type;
        container.setAttribute('data-for', (elements.length - 1).toString());

        dom.insertBefore(el, container);
    };

    dom.find('.js-number').iterate(function(el) {
        dom.selectOnFocus(el);

        elements.push(el);

        setSpinner('−', el);
        setSpinner('+', el);
    });

});