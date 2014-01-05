(function() {

    'use strict';
    
    var updateSettingPlaceholder = function(el) {
        el.nextSibling.textContent = el.options[el.selectedIndex].textContent;
    };

    var $settings = mk.$('.js-setting');

    $settings.iterate(function(el) {
        var placeholderEl = document.createElement('span');
        placeholderEl.classList.add('text-middle');
        placeholderEl.classList.add('setting-mode-not-part');

        mk.$insertBefore(el, placeholderEl);

        el.classList.add('setting-mode-part');

        updateSettingPlaceholder(el);

        mk.$Listen(el, ['change'], updateSettingPlaceholder.bind(null, el));
    });

    mk.Events.listen('loaded', function() {
        $settings.iterate(function(el) {
            updateSettingPlaceholder(el);
        });
    });

    var toggleModeEl = mk.$id('settings-toggle-mode');
    var toggleSettings = function() {
        mk.$toggleClass(document.documentElement, 'setting-mode-disabled', !toggleModeEl.checked);
        mk.$toggleClass(document.documentElement, 'setting-mode-enabled', toggleModeEl.checked);

        localStorage.setItem('settingsMode', (toggleModeEl.checked ? 'on' : 'off'));
    };

    mk.$Listen(toggleModeEl, ['change'], function() {
        toggleSettings();
        mk.Events.trigger('goal', {'id': 'SETTINGS_SWITCH'}, true);
    });

    var settingsModeValue = localStorage.getItem('settingsMode');
    if (settingsModeValue !== 'off') {
        settingsModeValue = 'on';
    }
    toggleModeEl.checked = (settingsModeValue === 'on');
    toggleSettings();

    mk.Events.trigger('goal', {
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
        mk.Events.trigger('goal', {
            'id': 'SETTINGS_TH',
            'params': {
                'level': 'th' + th
            }
        }, true);

        mk.calc.armyCamps.value = getSettingValue(th, mk.calc.armyCampsData.th);
        updateSettingPlaceholder(mk.calc.armyCamps);

        mk.calc.spellFactoryLevel.value = getSettingValue(th, mk.calc.spellFactoryData.th);
        updateSettingPlaceholder(mk.calc.spellFactoryLevel);

        mk.calc.allBarracks.units.setLevels(
            getSettingValue(th, mk.calc.barracksData.units.th),
            updateSettingPlaceholder
        );
        mk.calc.allBarracks.dark.setLevels(
            getSettingValue(th, mk.calc.barracksData.dark.th),
            updateSettingPlaceholder
        );

        mk.objectIterate(mk.calc.types, function(type, items) {
            mk.objectIterate(items, function(name, data) {
                var levelEl = mk.$id(name + '-level');
                levelEl.value = data[1][getSettingValue(th, data[4]) - 1];
                updateSettingPlaceholder(levelEl);
            });
        });

        mk.Events.trigger('calculate', {
            'type': 'all',
            'computeAll': true
        });
    };

    mk.$('.js-settings-level').iterate(function(el) {
        mk.$Listen(el, ['universalClick'], setLevels.bind(null, parseInt(el.textContent, 10)));
    });

}());
