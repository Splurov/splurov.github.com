part(['events', 'dom'], function(events, dom) {

    'use strict';

    dom.registerUniversalClickHandler('js-reset', function(e) {
        var resetType = e.target.getAttribute('data-reset');
        var scope = e.target.getAttribute('data-scope');

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
