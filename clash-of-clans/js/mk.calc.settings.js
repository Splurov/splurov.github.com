part([
    'dom',
    'goal',
    'collection',
    'calculateCurrent',
    'localStorageSet',
    'storage'
], function(dom, goal, collection, calculateCurrent, localStorageSet, storage) {

    'use strict';

    var getSettingValue = function(selectedTh, allTh) {
        while (!allTh.hasOwnProperty(selectedTh) && selectedTh > 0) {
            selectedTh--;
        }
        return allTh[selectedTh];
    };

    var setLevels = function(th) {
        collection.updateSetting(th, getSettingValue);

        goal.reach('SETTINGS_TH', {'settingsLevel': th.toString()});

        calculateCurrent('all');
    };

    dom.find('.js-settings-level').listen('universalClick', function(e) {
        setLevels(parseInt(e.currentTarget.textContent, 10));
    });

});
