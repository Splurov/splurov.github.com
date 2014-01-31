part('boostedCollection', [
    'dom',
    'goal',
    'calculateCurrent'
], function(dom, goal, calculateCurrent) {
    'use strict';

    var boostedCollection = (function() {
        var items = {};

        return {
            'add': function(key, type) {
                var params = {
                    'type': type,
                    'el': dom.id(key)
                };
                items[key] = params;
                if (localStorage.getItem(key) === 'yes') {
                    params.el.checked = true;
                }
            },
            'update': function(key) {
                goal.reach('BOOSTED', {'boostedType': items[key].type});

                localStorage.setItem(key, (items[key].el.checked ? 'yes': 'no'));

                calculateCurrent(items[key].type);
            }
        };
    }());

    return boostedCollection;

});