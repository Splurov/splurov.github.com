(function(window, document, mk){

    'use strict';

    var spinnerAction = function(eventElement) {
        var targetElement = eventElement.spinnerTarget;
        var multiplier = parseInt(targetElement.getAttribute('step'), 10) || 1;
        var current = parseInt(targetElement.value, 10);
        if (eventElement.textContent === '+') {
            if (isNaN(current)) {
                targetElement.value = multiplier;
            } else {
                targetElement.value = current + multiplier;
            }
        } else {
            if (isNaN(current) || current < 2) {
                targetElement.value = 0;
            } else {
                targetElement.value = current - multiplier;
            }
        }
        mk.calc.calculate(targetElement.getAttribute('data-object-type'));
    };

    var spinnerInterval = null;
    var spinnerTimeout = null;

    var spinnerHold = function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.target.spinnerClicked = true;
        spinnerTimeout = window.setTimeout(function(eventElement) {
            eventElement.spinnerClicked = false;
            (function fakeInterval() {
                spinnerInterval = window.setTimeout(function() {
                    spinnerAction(eventElement);
                    fakeInterval();
                }, 100);
            }());
        }.bind(null, e.target), 500);
    };

    var spinnerRelease = function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.target.spinnerClicked) {
            spinnerAction(e.target);
        }
        clearTimeout(spinnerTimeout);
        clearInterval(spinnerInterval);
    };

    var setSpinner = function(type, el) {
        var span = document.createElement('span');
        span.className = 'button button_after button_middle';
        span.textContent = (type === 'plus' ? '+' : '−');
        span.spinnerTarget = el;

        span.addEventListener('touchstart', spinnerHold);
        span.addEventListener('touchend', spinnerRelease);
        span.addEventListener('mousedown', spinnerHold);
        span.addEventListener('mouseup', spinnerRelease);

        if (el.nextSibling) {
            el.parentNode.insertBefore(span, el.nextSibling);
        } else {
            el.parentNode.appendChild(span);
        }
    };

    mk.toArray(document.getElementsByClassName('js-number')).forEach(function(el) {
        el.addEventListener('focus', mk.selectAll, false);
        setSpinner('minus', el);
        setSpinner('plus', el);
    });

}(window, document, window.mk));