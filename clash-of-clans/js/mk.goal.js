part(['events', 'dom'], function(events, dom) {

    'use strict';

    dom.registerUniversalClickAndMiddleClickHandler('js-goal', function(e) {
        events.trigger('goal', {
            'id': e.target.getAttribute('data-goal')
        }, true);
    });

    var cache = [];

    window.yandexMetrikaLoadCallback = function(yandexMetrika) {
        events.watch('goal', function(data) {
            if (cache.indexOf(data.id) !== -1) {
                return;
            }
            cache.push(data.id);

            var target = data.id;
            var params = data.params || null;

            yandexMetrika.reachGoal(target, params);
        });
    };

});
