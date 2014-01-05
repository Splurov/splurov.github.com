(function(){

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
        mk.Events.trigger('calculate', {
            'type': targetElement.getAttribute('data-object-type')
        });
    };

    var spinnerInterval = null;
    var spinnerTimeout = null;

    var spinnerHold = function(e) {
        e.preventDefault();
        e.currentTarget.spinnerClicked = true;
        spinnerTimeout = setTimeout(function(eventElement) {
            eventElement.spinnerClicked = false;
            (function fakeInterval() {
                spinnerInterval = setTimeout(function() {
                    spinnerAction(eventElement.spinnerTarget, eventElement.textContent);
                    fakeInterval();
                }, 100);
            }());
        }.bind(null, e.currentTarget), 500);
    };

    var spinnerRelease = function(e) {
        e.preventDefault();
        if (e.currentTarget.spinnerClicked) {
            spinnerAction(e.currentTarget.spinnerTarget, e.currentTarget.textContent);
        }
        clearTimeout(spinnerTimeout);
        clearInterval(spinnerInterval);
    };

    var setSpinner = function(type, el) {
        var container = document.createElement('button');
        container.className = 'button button_spinner';
        container.textContent = (type === 'plus' ? '+' : '−');
        container.spinnerTarget = el;

        mk.$Listen(container, ['touchstart', 'mousedown'], spinnerHold);
        mk.$Listen(container, ['touchend', 'mouseup'], spinnerRelease);

        mk.$insertBefore(el, container);
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

    mk.$('.js-number').iterate(function(el) {
        el.addEventListener('focus', mk.selectAll, false);
        setSpinner('minus', el);
        setSpinner('plus', el);

        el.addEventListener('keydown', spinnerKeyboard, false);
    });

}());