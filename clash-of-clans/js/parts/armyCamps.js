var DOM_ENABLED = true;
if (typeof exports !== 'undefined') {
    DOM_ENABLED = false;
    var part = require('../part.js');
}

part('armyCamps', ['dom', 'events', 'savedData'], function(dom, events, savedData) {
    'use strict';

    var data = {
        'base': [20, 30, 40, 50],
        'step': 5,
        'max': 240,
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
    };

    if (DOM_ENABLED) {
        var el = dom.id('army-camps');

        var updateSavedData = function(value) {
            savedData.current.set('army-camps', parseInt(value, 10));
        };

        var notifyChange = function() {
            events.trigger('elChange', el);
        };

        dom.listen(el, 'change', function() {
            updateSavedData(el.value);
            notifyChange();

            events.trigger('calculate', {
                'type': 'all'
            });
        });

        events.watch('updateFromSaved', function() {
            el.value = savedData.current.get('army-camps', el.value);
            updateSavedData(el.value);
            notifyChange();
        });

        events.watch('updateSetting', function(params) {
            var value = params.helper(params.th, data.th);
            el.value = value;
            updateSavedData(value);
            notifyChange();
        });
    }

    return data;
});
