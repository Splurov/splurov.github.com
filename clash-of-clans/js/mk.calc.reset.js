part(['events', 'dom'], function(events, dom) {

    'use strict';

    dom.find('.js-reset').listen('universalClick', function(e) {
        var resetType = e.currentTarget.getAttribute('data-reset');
        var scope = e.currentTarget.getAttribute('data-scope');

        dom.find('input.js-comp-' + scope + '[data-type="' + resetType + '"]').iterate(function(el) {
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
    });

});
