(function(mk, Hogan) {

    'use strict';

    var setDefaults = function() {
        mk.calc.allBarracks.units.setDefaults();
        mk.calc.allBarracks.dark.setDefaults();

        var armyCampsSaved = mk.calc.savedData.get('armyCamps', mk.calc.armyCamps.value);
        var armyCampsOption = mk.calc.armyCamps.querySelector('option[value="' + armyCampsSaved + '"]');
        if (armyCampsOption) {
            armyCampsOption.selected = true;
        }

        var spellFactoryIndex = mk.calc.savedData.get('spellFactoryLevel', mk.calc.spellFactoryLevel.selectedIndex);
        mk.calc.spellFactoryLevel.options[spellFactoryIndex].selected = true;

        var setItems = function(type) {
            mk.objectIterate(mk.calc.types[type], function(name) {
                var levelId = name + '-level';
                var levelEl = document.getElementById(levelId);
                levelEl.options[mk.calc.savedData.get(levelId, levelEl.selectedIndex)].selected = true;

                document.getElementById(name).value = mk.calc.savedData.get(name) || 0;
                if (type !== 'spells') {
                    var subtractId = name + '-subtract';
                    document.getElementById(subtractId).value = mk.calc.savedData.get(subtractId) || 0;
                }
            });
        };

        setItems('units');
        setItems('spells');
        setItems('dark');
    };

    mk.Events.listen('setDefaults', setDefaults);

    var triggerCalculate = function(type) {
        mk.Events.trigger('calculate', {
            'type': type
        });
    };

    mk.objectIterate(mk.calc.allBarracks, function(k, v) {
        v.getElements().forEach(function(el) {
            el.addEventListener('change', triggerCalculate.bind(null, 'barrack-' + k), false);
        });
    });
    mk.calc.armyCamps.addEventListener('change', triggerCalculate.bind(null, 'all'), false);
    mk.calc.spellFactoryLevel.addEventListener('change', triggerCalculate.bind(null, 'spells'), false);

    mk.objectIterate(mk.calc.types, function(type, objects) {
        mk.objectIterate(objects, function(name) {
            document.getElementById(name + '-level').addEventListener(
                'change',
                triggerCalculate.bind(null, type),
                false
            );
            document.getElementById(name).addEventListener(
                'input',
                triggerCalculate.bind(null, type),
                false
            );

            if (type === 'units' || type === 'dark') {
                document.getElementById(name + '-subtract').addEventListener(
                    'input',
                    triggerCalculate.bind(null, type),
                    false
                );
            }
        });
    });

    mk.Events.trigger('setDefaults');
    
    mk.Events.trigger('calculate', {
        'type': 'all',
        'allCosts': true
    });

}(window.mk, window.Hogan));
