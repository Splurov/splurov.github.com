var DOM_ENABLED = true;
if (typeof exports !== 'undefined') {
    DOM_ENABLED = false;
    var part = require('../part.js');
}

part('spellFactory', ['dom', 'events', 'savedData', 'goal'], function(dom, events, savedData, goal) {
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
        var levelEl = dom.id('spells-level');
        var boostedEl = dom.id('spells-boosted');

        var updateLevelSavedData = function(value) {
            savedData.current.set('spells-level', parseInt(value, 10));
        };

        var notifyLevelChange = function() {
            events.trigger('elChange', levelEl, true);
        };

        dom.listen(levelEl, 'change', function() {
            updateLevelSavedData(levelEl.value);
            notifyLevelChange();

            events.trigger('calculate', {
                'type': 'spells'
            });
        });

        dom.listen(boostedEl, 'change', function() {
            goal.reach('BOOSTED', {'boostedType': data.type});

            localStorage.setItem('spells-boosted', (boostedEl.checked ? 'yes' : 'no'));

            events.trigger('calculate', {
                'type': 'spells'
            });
        });

        events.watch('updateFromSaved', function() {
            levelEl.value = savedData.current.get('spells-level', levelEl.value);
            updateLevelSavedData(levelEl.value);
            notifyLevelChange();

            boostedEl.checked = (localStorage.getItem('spells-boosted') === 'yes');
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
