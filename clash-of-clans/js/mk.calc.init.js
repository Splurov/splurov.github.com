part([
    'storage',
    'types',
    'dom',
    'collection',
    'boostedCollection',
    'calculateCurrent'
], function(storage, types, dom, collection, boostedCollection, calculateCurrent) {
    'use strict';

    dom.listen(document.body, 'change', function(e) {
        if (e.target.classList.contains('js-comp-level')) {
            collection.update(e.target.getAttribute('id'));
        } else if (e.target.classList.contains('js-comp-boosted')) {
            boostedCollection.update(e.target.getAttribute('id'));
        }
    });

    collection.add('army-camps', {
        'calculateType': 'all',
        'th': {
            1: 20,
            2: 30,
            3: 70,
            4: 80,
            5: 135,
            6: 150,
            7: 200,
            9: 220,
            10: 240
        }
    });

    collection.add('spells-level', {
        'calculateType': 'spells',
        'th': {
            1: 0,
            5: 1,
            6: 2,
            7: 3,
            9: 4,
            10: 5
        },
        'onUpdate': function(key) {
            dom.updater.instantly(
                'spells-boosted-wrapper',
                'display',
                (storage.current.get(key) === 0 ? 'none' : '')
            );
        }
    });

    boostedCollection.add('spells-boosted', 'spells');

    ['light', 'dark'].forEach(function(type) {
        var barrackData = types.buildings[type];
        var i = 0;
        while (++i <= barrackData.count) {
            collection.add(type + '-level-' + i, {
                'index': i,
                'calculateType': 'barrack-' + type,
                'th': barrackData.th,
                'onUpdate': function(key, params) {
                    var header = '';
                    var level = storage.current.get(key);
                    if (level !== 0) {
                        header = barrackData.queue[level];
                    }
                    dom.updater.instantly(type + '-maxSpace-' + params.index, 'text', header);
                    dom.updater.instantly(type + '-levelText-' + params.index, 'text', level);

                    dom.updater.instantly(type + '-barrack-info-' + params.index, 'display',
                                          (level === 0 ? 'none' : ''));

                }
            });

            boostedCollection.add(type + '-boosted-' + i, type);
        }
    });

    types.iterateTree(function(type, name, properties) {
        collection.add(name + '-level', {
            'calculateType': '__fromAttr',
            'th': properties[4],
            'attachEvent': false
        });
    });


    /**
     * QUANTITY / SUBTRACT
     */

    dom.listen(document.body, 'input', function(e) {
        var el = e.target;
        var isQuantity = el.classList.contains('js-comp-quantity');
        var isSubtract = el.classList.contains('js-comp-subtract');
        if (isQuantity || isSubtract) {
            var value = parseInt(el.value, 10) || 0;
            if (value < 0) {
                value = 0;
            }
            el.value = value || '';

            if (isQuantity) {
                storage.current.set(el.getAttribute('id'), value);
            }

            calculateCurrent(el.getAttribute('data-type'));
        }

    });

    dom.listenCustom('storageUpdated', function() {
        types.iterateTree(function(type, name) {
            dom.id(name).value = storage.current.get(name) || '';
        });
    });


    /**
     * INIT
     */

    dom.triggerCustom('storageUpdated');

    calculateCurrent('all');

});
