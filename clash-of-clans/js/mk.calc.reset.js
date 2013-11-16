(function(){

    'use strict';

    var resetColumn = function(e) {
        var resetType = e.currentTarget.getAttribute('data-reset-type');
        var scope = e.currentTarget.getAttribute('data-scope');

        mk.$('input[data-field-type="' + scope + '"][data-object-type="' + resetType + '"]').iterate(function(el) {
            el.value = '';
        });

        mk.Events.trigger('calculate', {
            'type': resetType
        });

        mk.Events.trigger('goal', {
            'id': 'RESET'
        }, true);
    };

    mk.$('.js-reset').listen(['click'], resetColumn);

}());