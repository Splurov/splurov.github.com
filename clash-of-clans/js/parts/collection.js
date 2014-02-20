part('collection', [
    'dom',
    'storage',
    'calculateCurrent'
], function(dom, storage, calculateCurrent) {
    'use strict';

    var collection = (function() {
        var items = {};

        var update = function(key, params, source, newValue) {
            if (Array.isArray(newValue)) {
                newValue = newValue[params.index - 1];
            }

            storage.current.set(key, parseInt(newValue, 10));

            if (source === 'dom') {
                calculateCurrent(params.calculateType);
            }

            var newValueString = newValue.toString();

            if ((source === 'storage' || source === 'settings') && params.el.value !== newValueString) {
                params.el.value = newValueString;

                if (source === 'settings') {
                    params.el.parentNode.classList.add('changed-animation');
                }
            }

            if (params.onUpdate) {
                params.onUpdate(key, params);
            }
        };

        return {
            'add': function(key, params) {
                params.el = dom.id(key);
                dom.listen(params.el.parentNode, 'animationend', function(e) {
                    e.target.classList.remove('changed-animation');
                });

                if (params.calculateType === '__fromAttr') {
                    params.calculateType = params.el.getAttribute('data-type');
                }

                if (!params.update) {
                    params.update = update;
                }

                items[key] = params;
            },
            'update': function(key) {
                var params = items[key];
                params.update(key, params, 'dom', params.el.value);
            },
            'updateFromStorage': function() {
                Object.keys(items).forEach(function(key) {
                    var params = items[key];
                    params.update(
                        key,
                        params,
                        'storage',
                        storage.current.get(key, params.el.value)
                    );
                });
            },
            'updateSetting': function(th, helper) {
                Object.keys(items).forEach(function(key) {
                    var params = items[key];
                    params.update(key, params, 'settings', helper(th, params.th));
                });
            }
        };
    }());

    dom.listenCustom('storageUpdated', collection.updateFromStorage);

    return collection;

});
