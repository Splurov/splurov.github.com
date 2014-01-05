(function() {

    'use strict';

    var setDefaults = function() {
        mk.calc.allBarracks.units.setDefaults();
        mk.calc.allBarracks.dark.setDefaults();

        mk.calc.armyCamps.value = mk.calc.savedData.get('armyCamps', mk.calc.armyCamps.value);

        var spellFactoryIndex = mk.calc.savedData.get('spellFactoryLevel', mk.calc.spellFactoryLevel.selectedIndex);
        mk.calc.spellFactoryLevel.options[spellFactoryIndex].selected = true;

        mk.calc.spellFactoryBoosted.checked = (localStorage.getItem('spell-factory-boosted') === 'yes');

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
            mk.$Listen(el, ['change'], triggerCalculate.bind(null, 'barrack-' + k));
        });
    });
    mk.$Listen(mk.calc.armyCamps, ['change'], triggerCalculate.bind(null, 'all'));
    mk.$Listen(mk.calc.spellFactoryLevel, ['change'], triggerCalculate.bind(null, 'spells'));
    mk.$Listen(mk.calc.spellFactoryBoosted, ['change'], function() {
        localStorage.setItem('spell-factory-boosted', (mk.calc.spellFactoryBoosted.checked ? 'yes' : 'no'));
        triggerCalculate('spells');
    });

    var boostedListener = function(type, e) {
        var el = e.currentTarget;
        localStorage.setItem(el.getAttribute('id'), (el.checked ? 'yes' : 'no'));
        triggerCalculate(type);
    };

    mk.objectIterate(mk.calc.barracksData, function(type, data) {
        var i = 0;
        while (++i <= data.count) {
            var id = data.prefix + '-boosted-' + i;
            var boosted = mk.$id(id);
            if (localStorage.getItem(id) === 'yes') {
                boosted.checked = true;
            }
            mk.$Listen(boosted, ['change'], boostedListener.bind(null, type));
        }
    });

    mk.objectIterate(mk.calc.types, function(type, objects) {
        mk.objectIterate(objects, function(name) {
            var triggerFunc = triggerCalculate.bind(null, type);

            mk.$Listen(mk.$id(name + '-level'), ['change'], triggerFunc);
            mk.$Listen(mk.$id(name), ['input'], triggerFunc);

            if (type === 'units' || type === 'dark') {
                mk.$Listen(mk.$id(name + '-subtract'), ['input'], triggerFunc);
            }
        });
    });

    mk.Events.trigger('setDefaults');
    
    mk.Events.trigger('calculate', {
        'type': 'all',
        'computeAll': true
    });

}());
