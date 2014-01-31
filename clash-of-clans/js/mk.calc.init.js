part([
    'savedData',
    'types',
    'events',
    'dom',
    'collection',
    'boostedCollection',
    'calculateCurrent'
], function(savedData, types, events, dom, collection, boostedCollection, calculateCurrent) {
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
        }
    });

    boostedCollection.add('spells-boosted', 'spells');

    ['light', 'dark'].forEach(function(type) {
        var barrackData = types.buildings[type];
        var i = 0;
        while (++i <= barrackData.count) {
            collection.add(type + '-level-' + i, {
                'calculateType': 'barrack-' + type,
                'th': barrackData.th,
                'onUpdate': function(el) {
                    var header = '';
                    var level = el.value;
                    if (level !== 0) {
                        header = barrackData.queue[level];
                    }
                    dom.updater.instantly(type + '-maxSpace-' + el.getAttribute('data-num'), 'text', header);
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

    var valueChangeHandler = function(params) {
        var isQuantity = params.el.classList.contains('js-comp-quantity');
        var isSubtract = params.el.classList.contains('js-comp-subtract');
        if (isQuantity || isSubtract) {
            var value = parseInt(params.el.value, 10) || 0;
            if (value < 0) {
                value = 0;
            }
            params.el.value = value || '';

            if (isQuantity) {
                savedData.current.set(params.el.getAttribute('id'), value);
            }

            if (params.calculate) {
                calculateCurrent(params.el.getAttribute('data-type'));
            }
        }
    };

    dom.listen(document.body, 'input', function(e) {
        valueChangeHandler({
            'el': e.target,
            'calculate': true
        });
    });

    events.watch('valueChange', valueChangeHandler);

    events.watch('updateFromSaved', function() {
        types.iterateTree(function(type, name) {
            dom.id(name).value = savedData.current.get(name) || '';
        });
    });


    /**
     * INIT
     */

    events.trigger('updateFromSaved');

    calculateCurrent('all');

});
