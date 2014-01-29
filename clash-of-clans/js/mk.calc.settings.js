part(['events', 'dom', 'goal'], function(events, dom, goal) {

    'use strict';

    events.watch('elChange', function(el) {
        dom.updater.instantly(el.getAttribute('id') + '-text', 'text', el.options[el.selectedIndex].textContent);
    });

    var toggleModeEl = dom.id('settings-toggle-mode');
    var toggleSettings = function() {
        dom.toggleClass(document.documentElement, 'setting-mode-disabled', !toggleModeEl.checked);
        dom.toggleClass(document.documentElement, 'setting-mode-enabled', toggleModeEl.checked);

        localStorage.setItem('settingsMode', (toggleModeEl.checked ? 'on' : 'off'));

        dom.toggleClass(toggleModeEl.parentNode, 'button_pressed', toggleModeEl.checked);
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
        goal.reach('SETTINGS_TH', {'settingsLevel': 'th' + th});

        events.trigger('updateSetting', {
            'th': th,
            'helper': getSettingValue
        });

        events.trigger('calculate', {
            'type': 'all'
        });
    };

    dom.find('.js-settings-level').listen('universalClick', function(e) {
        setLevels(parseInt(e.currentTarget.textContent, 10));
    });

});
