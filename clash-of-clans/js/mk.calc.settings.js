(function(mk) {

    'use strict';
    
    var updateSettingPlaceholder = function(el) {
        el.nextSibling.textContent = el.options[el.selectedIndex].textContent;
    };

    mk.getAllByClass('js-setting').forEach(function(el) {
        var placeholderEl = document.createElement('span');
        placeholderEl.classList.add('text-middle', 'setting-mode-not-part');
        placeholderEl.textContent = el.options[el.selectedIndex].textContent;

        if (el.nextSibling) {
            el.parentNode.insertBefore(placeholderEl, el.nextSibling);
        } else {
            el.parentNode.appendChild(placeholderEl);
        }

        el.classList.add('setting-mode-part');

        el.addEventListener('change', function(e) {
            updateSettingPlaceholder(e.currentTarget);
        }, false);
    });

    var toggleModeEl = document.getElementById('js-settings-toggle-mode');
    var toggleSettings = function(value) {
        if (value === 0) {
            toggleModeEl.checked = false;
            document.documentElement.classList.add('setting-mode-disabled');
            document.documentElement.classList.remove('setting-mode-enabled');
        } else {
            toggleModeEl.checked = true;
            document.documentElement.classList.remove('setting-mode-disabled');
            document.documentElement.classList.add('setting-mode-enabled');
        }

        mk.calc.savedData.set('settingsMode', value);
        mk.calc.savedDataAll.update(0, mk.calc.savedData);
        mk.calc.savedDataStorage.save(mk.calc.savedDataAll.getAll());
    };

    mk.addEvents(document.getElementById('js-settings-toggle'), ['click', 'touchend'], function(e) {
        e.preventDefault();
        e.stopPropagation();

        toggleSettings(toggleModeEl.checked ? 0 : 1);
        mk.Events.trigger('goal', {'id': 'SETTINGS_SWITCH'}, true);
    });

    var settingsModeValue = mk.calc.savedData.get('settingsMode', 1);

    toggleSettings(settingsModeValue);

    mk.Events.trigger('goal', {
        'id': 'SETTINGS_INIT',
        'params': {
            'mode': (settingsModeValue === 0 ? 'off' : 'on')
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
                'level': th
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
                var levelEl = document.getElementById(name + '-level');
                levelEl.value = data[1][getSettingValue(th, data[4]) - 1];
                updateSettingPlaceholder(levelEl);
            });
        });

        mk.Events.trigger('calculate', {
            'type': 'all',
            'allCosts': true
        });
    };

    mk.getAllByClass('js-settings-level').forEach(function(el) {
        mk.addEvents(el, ['click', 'touchend'], function(e) {
            setLevels(parseInt(e.currentTarget.textContent, 10));
        });
    });

}(window.mk));
