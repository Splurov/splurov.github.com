var DOM_ENABLED = true;
if (typeof exports !== 'undefined') {
    DOM_ENABLED = false;
    var part = require('../part.js');
}

part('spellFactory', ['dom', 'events', 'savedData'], function(dom, events, savedData) {
    'use strict';

    var data = {
        'max': 5,
        'th': {
            1: 0,
            5: 1,
            6: 2,
            7: 3,
            9: 4,
            10: 5
        }
    };

    if (DOM_ENABLED) {
        var levelEl = dom.id('spell-factory-level');
        var boostedEl = dom.id('spell-factory-boosted');

        var updateLevelSavedData = function(value) {
            savedData.current.set('spellFactoryLevel', parseInt(value, 10));
        };

        var notifyLevelChange = function() {
            events.trigger('elChange', levelEl, true);
        };

        dom.listen(levelEl, 'change', function(e) {
            e.stopPropagation();

            updateLevelSavedData(levelEl.value);
            notifyLevelChange();

            events.trigger('calculate', {
                'type': 'spells'
            });
        });

        dom.listen(boostedEl, 'change', function(e) {
            e.stopPropagation();

            localStorage.setItem('spell-factory-boosted', (boostedEl.checked ? 'yes' : 'no'));

            events.trigger('calculate', {
                'type': 'spells'
            });
        });

        events.watch('updateFromSaved', function() {
            levelEl.value = savedData.current.get('spellFactoryLevel', levelEl.value);
            updateLevelSavedData(levelEl.value);
            notifyLevelChange();

            boostedEl.checked = (localStorage.getItem('spell-factory-boosted') === 'yes');
        });

        events.watch('updateSetting', function(params) {
            var value = params.helper(params.th, data.th);
            levelEl.value = value;
            updateLevelSavedData(value);
            notifyLevelChange();
        });
    }

    return data;

});
