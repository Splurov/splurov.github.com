part(['events', 'dom'], function(events, dom) {

    'use strict';

    var resetColumn = function(e) {
        var resetType = e.currentTarget.getAttribute('data-reset-type');
        var scope = e.currentTarget.getAttribute('data-scope');

        dom.find('input[data-component="' + scope + '"][data-type="' + resetType + '"]').iterate(function(el) {
            el.value = '';
            events.trigger('valueChange', {
                'el': el,
                'calculate': false
            });
        });

        events.trigger('calculate', {
            'type': resetType
        });

        events.trigger('goal', {
            'id': 'RESET'
        }, true);
    };

    dom.find('.js-reset').listen(['universalClick'], resetColumn);

});
