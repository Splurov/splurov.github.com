(function(window, document, mk){

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
                targetElement.value = 0;
            } else {
                targetElement.value = current - 1;
            }
        }
        mk.calc.calculate(targetElement.getAttribute('data-object-type'));
    };

    var spinnerInterval = null;
    var spinnerTimeout = null;

    var spinnerHold = function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.spinnerClicked = true;
        spinnerTimeout = window.setTimeout(function(eventElement) {
            eventElement.spinnerClicked = false;
            (function fakeInterval() {
                spinnerInterval = window.setTimeout(function() {
                    spinnerAction(eventElement.spinnerTarget, eventElement.textContent);
                    fakeInterval();
                }, 100);
            }());
        }.bind(null, e.currentTarget), 500);
    };

    var spinnerRelease = function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.spinnerClicked) {
            spinnerAction(e.currentTarget.spinnerTarget, e.currentTarget.textContent);
        }
        clearTimeout(spinnerTimeout);
        clearInterval(spinnerInterval);
    };

    var setSpinner = function(type, el) {
        var span = document.createElement('span');
        span.className = 'button button_after button_middle';
        span.textContent = (type === 'plus' ? '+' : '−');
        span.spinnerTarget = el;

        mk.addEvents(span, ['touchstart', 'mousedown'], spinnerHold);
        mk.addEvents(span, ['touchend', 'mouseup'], spinnerRelease);

        if (el.nextSibling) {
            el.parentNode.insertBefore(span, el.nextSibling);
        } else {
            el.parentNode.appendChild(span);
        }
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

    mk.getAllByClass('js-number').forEach(function(el) {
        el.addEventListener('focus', mk.selectAll, false);
        setSpinner('minus', el);
        setSpinner('plus', el);

        el.addEventListener('keydown', spinnerKeyboard, false);
    });

}(window, document, window.mk));