(function(mk) {

    'use strict';

    var elements = mk.getAllByClass('js-goal');
    elements.forEach(function(el) {
        mk.addEvents(el, ['click', 'touchend'], function(e) {
            mk.Events.trigger('goal', {
                'id': e.currentTarget.getAttribute('data-goal')
            }, true);
        });
    });

    var cache = [];

    window.yandexMetrikaLoadCallback = function(yandexMetrika) {
        mk.Events.listen('goal', function(data) {
            if (cache.indexOf(data.id) !== -1) {
                return;
            }
            cache.push(data.id);

            var target = data.id;
            var params = data.params || null;

            yandexMetrika.reachGoal(target, params);
        });
    };

}(window.mk));
