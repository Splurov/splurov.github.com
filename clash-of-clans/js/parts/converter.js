part('converter', [
    'goal'
], function(goal) {

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

    var oldConvert4to5 = function(data) {
        var levelIndexes = [0,18,19,20,21,22,23,24,25,26,27,32,33,34,35,40,41,42,43,45,47];
        levelIndexes.forEach(function(keyIndex) {
            data[keyIndex]++;
        });
    };

    if (localStorage.getItem('data3') && !localStorage.getItem('data4')) {
        var parts3 = JSON.parse(localStorage.getItem('data3'));
        parts3.forEach(function(part, partIndex) {
            oldConvert3to4(part, (partIndex === 0));
        });

        localStorage.setItem('data4', JSON.stringify(parts3));

        goal.reach('CONVERTED3TO4');
    }

    if (localStorage.getItem('data4') && !localStorage.getItem('data5')) {
        var parts4 = JSON.parse(localStorage.getItem('data4'));
        parts4.forEach(oldConvert4to5);

        localStorage.setItem('data5', JSON.stringify(parts4));

        goal.reach('CONVERTED4TO5');
    }

    ['savedData', 'savedCalculations', 'data', 'data2', 'data3', 'data4'].forEach(function(key) {
        localStorage.removeItem(key);
    });

    return {
        'oldConvert3to4': oldConvert3to4,
        'oldConvert4to5': oldConvert4to5,
    };

});
