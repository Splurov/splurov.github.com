part([
    'dom',
    'goal',
    'collection',
    'calculateCurrent',
    'localStorageSet',
    'storage'
], function(dom, goal, collection, calculateCurrent, localStorageSet, storage) {

    'use strict';

    var toggleModeButton = dom.id('settings-toggle-button');
    var toggleModeEl = dom.id('settings-toggle-mode');
    var toggleSettings = function() {
        var setResult = localStorageSet(
            'settingsMode',
            (toggleModeEl.checked ? 'on' : 'off'),
            (storage.all.length - 1)
        );

        if (setResult) {
            dom.toggleClass(document.documentElement, 'setting-mode-disabled', !toggleModeEl.checked);
            dom.toggleClass(document.documentElement, 'setting-mode-enabled', toggleModeEl.checked);

            dom.toggleClass(toggleModeButton, 'button_pressed', toggleModeEl.checked);
        }
    };

    dom.listen(toggleModeEl, 'change', function() {
        toggleSettings();
        goal.reach('SETTINGS_SWITCH');
    });

    var settingsModeValue = localStorage.getItem('settingsMode');
    if (settingsModeValue !== 'off') {
        settingsModeValue = 'on';
    }
    toggleModeEl.checked = (settingsModeValue === 'on');
    toggleSettings();

    window.yandexMetrikaParams.settingsMode = settingsModeValue;

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
