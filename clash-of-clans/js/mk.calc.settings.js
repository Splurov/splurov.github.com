part(['events', 'dom'], function(events, dom) {

    'use strict';

    dom.find('.js-setting').iterate(function(el) {
        var placeholderEl = document.createElement('span');
        placeholderEl.className = 'text-middle setting-mode-not-part';

        dom.insertBefore(el, placeholderEl);

        el.classList.add('setting-mode-part');
    });

    events.listen('elChange', function(el) {
        el.nextSibling.textContent = el.options[el.selectedIndex].textContent;
    });

    var toggleModeEl = dom.id('settings-toggle-mode');
    var toggleSettings = function() {
        dom.toggleClass(document.documentElement, 'setting-mode-disabled', !toggleModeEl.checked);
        dom.toggleClass(document.documentElement, 'setting-mode-enabled', toggleModeEl.checked);

        localStorage.setItem('settingsMode', (toggleModeEl.checked ? 'on' : 'off'));
    };

    dom.listen(toggleModeEl, ['change'], function() {
        toggleSettings();
        events.trigger('goal', {'id': 'SETTINGS_SWITCH'}, true);
    });

    var settingsModeValue = localStorage.getItem('settingsMode');
    if (settingsModeValue !== 'off') {
        settingsModeValue = 'on';
    }
    toggleModeEl.checked = (settingsModeValue === 'on');
    toggleSettings();

    events.trigger('goal', {
        'id': 'SETTINGS_INIT',
        'params': {
            'mode': settingsModeValue
        }
    }, true);

    var getSettingValue = function(selectedTh, allTh) {
        while (!allTh.hasOwnProperty(selectedTh) && selectedTh > 0) {
            selectedTh--;
        }
        return allTh[selectedTh];
    };

    var setLevels = function(th) {
        events.trigger('goal', {
            'id': 'SETTINGS_TH',
            'params': {
                'level': 'th' + th
            }
        }, true);

        events.trigger('updateSetting', {
            'th': th,
            'helper': getSettingValue
        });

        events.trigger('calculate', {
            'type': 'all',
            'computeAll': true
        });
    };

    dom.find('.js-settings-level').listen(['universalClick'], function(e) {
        setLevels(parseInt(e.currentTarget.textContent, 10));
    });

});
