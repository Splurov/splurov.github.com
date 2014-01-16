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

    events.listen('updateFromSaved', function() {
        types.iterateTree(function(type, name) {
            var levelId = name + '-level';
            var levelEl = dom.id(levelId);
            updateEl(levelEl, savedData.current.get(levelId, levelEl.selectedIndex));
            notifyChange(levelEl);
        });
    });

    events.listen('updateSetting', function(params) {
        types.iterateTree(function(type, name, properties) {
            var levelEl = dom.id(name + '-level');

            updateEl(levelEl, params.helper(params.th, properties[4]) - 1);
            updateSavedData(levelEl);
            notifyChange(levelEl);
        });
    });

    dom.listen(document.body, ['change'], function(e) {
        if (e.target.getAttribute('data-component') === 'level') {
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

    dom.listen(document.body, ['input'], function(e) {
        var component = e.target.getAttribute('data-component');
        if (['subtract', 'quantity'].indexOf(component) !== -1) {
            if (component === 'quantity') {
                var value = parseInt(e.target.value, 10) || 0;
                if (value < 0) {
                    value = 0;
                }
                e.target.value = value || '';

                savedData.current.set(e.target.getAttribute('id'), value);
            }

            events.trigger('calculate', {
                'type': e.target.getAttribute('data-type')
            });
        }
    });

    events.listen('updateFromSaved', function() {
        types.iterateTree(function(type, name) {
            dom.id(name).value = savedData.current.get(name) || '';
        });
    });


    /**
     * INIT
     */

    events.trigger('updateFromSaved', true);

    events.trigger('calculate', {
        'type': 'all',
        'computeAll': true
    }, true);

});
