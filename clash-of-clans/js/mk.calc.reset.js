(function(mk){

    'use strict';

    var resetColumn = function(e) {
        e.preventDefault();
        e.stopPropagation();

        var resetType = e.currentTarget.getAttribute('data-reset-type');
        var scope = e.currentTarget.getAttribute('data-scope');

        mk.getAll('input[data-field-type="' + scope + '"][data-object-type="' + resetType + '"]').forEach(function(el) {
            el.value = '0';
        });

        mk.Events.trigger('calculate', resetType);
    };

    mk.getAllByClass('js-reset').forEach(function(el) {
        mk.addEvents(el, ['click', 'touchend'], resetColumn);
    });

}(window.mk));