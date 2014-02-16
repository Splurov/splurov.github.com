part([
    'dom',
    'goal'
], function(dom, goal) {

    'use strict';

    dom.find('.js-reset').listen('universalClick', function(e) {
        var resetType = e.currentTarget.getAttribute('data-reset');
        var scope = e.currentTarget.getAttribute('data-scope');

        dom.findCache('input.js-comp-' + scope + '[data-type="' + resetType + '"]').iterate(function(el) {
            el.value = '';
            dom.trigger(el, 'input');
        });

        goal.reach('RESET', {'resetType': resetType});
    });

});
