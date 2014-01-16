part('converter', ['events'], function(events) {

    'use strict';

    var oldConvert3to4 = function(data, replaceSettingsMode) {
        var subtractIndexes = [28,29,30,31,32,33,34,35,36,37,54,55,56,57,62];
        var settingsModeIndex = 63;

        var indexDiff = 0;
        subtractIndexes.forEach(function(keyIndex) {
            if (typeof data[keyIndex - indexDiff] !== 'undefined') {
                data.splice(keyIndex - indexDiff, 1);
                indexDiff++;
            }
        });
        if (typeof data[settingsModeIndex - indexDiff] !== 'undefined') {
            if (replaceSettingsMode) {
                localStorage.setItem('settingsMode', data[settingsModeIndex - indexDiff] === 2 ? 'off' : 'on');
            }
            data.splice(settingsModeIndex - indexDiff, 1);
        }
    };

    if (localStorage.getItem('data3') && !localStorage.getItem('data4')) {
        var parts = JSON.parse(localStorage.getItem('data3'));
        parts.forEach(function(part, partIndex) {
            oldConvert3to4(part, (partIndex === 0));
        });

        localStorage.setItem('data4', JSON.stringify(parts));

        events.trigger('goal', {'id': 'CONVERTED3TO4'}, true);
    }

    ['savedData', 'savedCalculations', 'data', 'data2', 'data3'].forEach(function(key) {
        localStorage.removeItem(key);
    });

    return {
        'oldConvert3to4': oldConvert3to4
    };

});
