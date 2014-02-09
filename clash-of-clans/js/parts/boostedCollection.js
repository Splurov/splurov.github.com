part('boostedCollection', [
    'dom',
    'goal',
    'calculateCurrent',
    'localStorageSet',
    'storage'
], function(dom, goal, calculateCurrent, localStorageSet, storage) {
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
                var setResult = localStorageSet(key, (items[key].el.checked ? 'yes': 'no'), (storage.all.length - 1));
                if (setResult) {
                    goal.reach('BOOSTED', {'boostedType': items[key].type});
                    calculateCurrent(items[key].type);
                }
            }
        };
    }());

    return boostedCollection;

});