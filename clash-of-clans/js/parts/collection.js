part('collection', [
    'dom',
    'savedData',
    'calculateCurrent'
], function(dom, savedData, calculateCurrent) {
    'use strict';

    var collection = (function() {
        var items = {};

        var update = function(key, params, source, newValue) {
            if (Array.isArray(newValue)) {
                newValue = newValue[params.index - 1];
            }

            savedData.current.set(key, parseInt(newValue, 10));

            if (source === 'dom') {
                calculateCurrent(params.calculateType);
            }

            if (source === 'storage' || source === 'settings') {
                params.el.value = newValue;
            }

            // update placeholder
            dom.updater.instantly(key + '-text', 'text', newValue);

            if (params.onUpdate) {
                params.onUpdate(key, params);
            }
        };

        return {
            'add': function(key, params) {
                params.el = dom.id(key);

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
                        savedData.current.get(key, params.el.value)
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
