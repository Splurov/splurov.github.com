(function(window, document, mk){

    'use strict';

    var resetColumn = function(e) {
        e.preventDefault();
        e.stopPropagation();
        var resetType = e.currentTarget.getAttribute('data-reset-type');
        mk.objectIterate(mk.calc.types[resetType], function(k) {
            var key = k;
            var scope = e.currentTarget.getAttribute('data-scope');
            if (scope !== 'quantity') {
                key += '-' + scope;
            }
            document.getElementById(key).value = '0';
        });
        mk.calc.calculate(resetType);
    };

    mk.getAllByClass('js-reset').forEach(function(el) {
        mk.addEvents(el, ['click', 'touchend'], resetColumn);
    });

}(window, document, window.mk));