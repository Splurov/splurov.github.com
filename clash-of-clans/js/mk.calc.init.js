part(['savedData', 'types', 'events', 'dom'], function(savedData, types, events, dom) {
    'use strict';

    /**
     * LEVELS
     */

    var updateSavedData = function(el) {
        savedData.current.set(el.getAttribute('id'), el.selectedIndex);
    };

    var updateEl = function(el, index) {
        el.options[index].selected = true;
    };

    var notifyChange = function(el) {
        events.trigger('elChange', el, true);
    };

    events.watch('updateFromSaved', function() {
        types.iterateTree(function(type, name) {
            var levelId = name + '-level';
            var levelEl = dom.id(levelId);
            updateEl(levelEl, savedData.current.get(levelId, levelEl.selectedIndex));
            updateSavedData(levelEl);
            notifyChange(levelEl);
        });
    });

    events.watch('updateSetting', function(params) {
        types.iterateTree(function(type, name, properties) {
            var levelEl = dom.id(name + '-level');

            updateEl(levelEl, params.helper(params.th, properties[4]) - 1);
            updateSavedData(levelEl);
            notifyChange(levelEl);
        });
    });

    dom.listen(document.body, 'change', function(e) {
        if (e.target.classList.contains('js-comp-level')) {
            updateSavedData(e.target);
            notifyChange(e.target);

            events.trigger('calculate', {
                'type': e.target.getAttribute('data-type')
            });
        }
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
                events.trigger('calculate', {
                    'type': params.el.getAttribute('data-type')
                });
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

    events.trigger('calculate', {
        'type': 'all'
    }, true);

});
