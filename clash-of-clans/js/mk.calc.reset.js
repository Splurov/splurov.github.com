part([
    'events',
    'dom',
    'goal',
    'calculateCurrent'
], function(events, dom, goal, calculateCurrent) {

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

        calculateCurrent(resetType);

        goal.reach('RESET', {'resetType': resetType});
    });

});
