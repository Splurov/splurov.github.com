(function() {

    'use strict';

    var setDefaults = function() {
        mk.calc.allBarracks.units.setDefaults();
        mk.calc.allBarracks.dark.setDefaults();

        mk.calc.armyCamps.value = mk.calc.savedData.get('armyCamps', mk.calc.armyCamps.value);

        var spellFactoryIndex = mk.calc.savedData.get('spellFactoryLevel', mk.calc.spellFactoryLevel.selectedIndex);
        mk.calc.spellFactoryLevel.options[spellFactoryIndex].selected = true;

        mk.objectIterate(mk.calc.types, function(type, objects) {
            mk.objectIterate(objects, function(name) {
                var levelId = name + '-level';
                var levelEl = mk.$id(levelId);
                levelEl.options[mk.calc.savedData.get(levelId, levelEl.selectedIndex)].selected = true;

                mk.$id(name).value = mk.calc.savedData.get(name) || '';
            });
        });
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
            mk.$id(name + '-level').addEventListener(
                'change',
                triggerCalculate.bind(null, type),
                false
            );
            mk.$id(name).addEventListener(
                'input',
                triggerCalculate.bind(null, type),
                false
            );

            if (type === 'units' || type === 'dark') {
                mk.$id(name + '-subtract').addEventListener(
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
        'computeAll': true
    });

}());
