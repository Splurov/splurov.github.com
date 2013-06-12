(function(window, document, mk){

    'use strict';

    var resetColumn = function(e) {
        e.preventDefault();
        e.stopPropagation();
        var resetType = e.target.getAttribute('data-reset-type');
        mk.objectIterate(mk.calc.types[resetType], function(k) {
            var key = k;
            var scope = e.target.getAttribute('data-scope');
            if (scope !== 'quantity') {
                key += '-' + scope;
            }
            document.getElementById(key).value = '0';
        });
        mk.calc.calculate(resetType);
    };

    mk.toArray(document.getElementsByClassName('js-reset')).forEach(function(el) {
        el.addEventListener('click', resetColumn, false);
        el.addEventListener('touchend', resetColumn, false);
    });

}(window, document, window.mk));