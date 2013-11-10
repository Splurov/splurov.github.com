(function(mk) {

    'use strict';
    
    var settingElements = mk.getAllByClass('js-setting'); 

    settingElements.forEach(function(el) {
        var placeholderEl = document.createElement('span');
        placeholderEl.style.display = 'none';
        placeholderEl.classList.add('text-middle');
        placeholderEl.textContent = el.options[el.selectedIndex].textContent;

        if (el.nextSibling) {
            el.parentNode.insertBefore(placeholderEl, el.nextSibling);
        } else {
            el.parentNode.appendChild(placeholderEl);
        }

        el.addEventListener('change', function(e) {
            el.nextSibling.textContent = e.currentTarget.options[e.currentTarget.selectedIndex].textContent;
        }, false);
    });

    var toggleEl = document.getElementById('js-settings-toggle');
    var toggleModeEl = document.getElementById('js-settings-toggle-mode');
    var toggleSettings = function(value) {
        toggleEl.setAttribute('data-mode', value);

        var settingDisplay;
        var placeholderDisplay;
        if (value === 0) {
            settingDisplay = 'none';
            placeholderDisplay = '';
            toggleModeEl.textContent = '☐';
        } else {
            settingDisplay = '';
            placeholderDisplay = 'none';
            toggleModeEl.textContent = '☑';
        }

        settingElements.forEach(function(el) {
            el.style.display = settingDisplay;
            el.nextSibling.style.display = placeholderDisplay;
        });

        mk.calc.savedData.set('settingsMode', value);
        mk.calc.savedDataAll.update(0, mk.calc.savedData);
        mk.calc.savedDataStorage.save(mk.calc.savedDataAll.getAll());
    };

    mk.addEvents(toggleEl, ['click', 'touchend'], function(e) {
        e.preventDefault();
        e.stopPropagation();

        toggleSettings((parseInt(e.currentTarget.getAttribute('data-mode'), 10) === 0 ? 1 : 0));
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

}(window.mk));
