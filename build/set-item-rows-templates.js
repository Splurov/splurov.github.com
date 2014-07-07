'use strict';

module.exports = function(vars) {

    require('../clash-of-clans/js/parts/common.js');

    require('../clash-of-clans/js/parts/types.js');

    var part = require('../clash-of-clans/js/part.js');

    var typesHelper = {
        'light': {
            'tabIndex': 10,
            'title': 'Barracks',
            'titleSingular': 'Barrack',
            'objectTitle': 'Troop',
            'capacityBuilding': 'Army Camps',
            'currencyCode': 'elixir'
        },
        'dark': {
            'tabIndex': 20,
            'title': 'Dark Barracks',
            'titleSingular': 'Dark Barrack',
            'objectTitle': 'Troop',
            'capacityBuilding': 'Army Camps',
            'currencyCode': 'dark-elixir'
        },
        'spells': {
            'tabIndex': 30,
            'title': 'Spell Factory',
            'objectTitle': 'Spell',
            'capacityBuilding': 'Spell Factory',
            'currencyCode': 'elixir'
        }
    };

    part(['types', 'common'], function(types, common) {
        var armyCamps = {
            'base': [20, 30, 40, 50],
            'step': 5,
            'max': 240
        };

        var createLevelOption = function(value, index) {
            return {'text': (index + 1)};
        };

        vars.types = [];

        Object.keys(typesHelper).forEach(function(type) {
            var basicInfo = typesHelper[type];
            basicInfo[type] = true;
            basicInfo.type = type;

            var rows = [];
            Object.keys(types.data[type]).forEach(function(name) {
                var value = types.data[type][name];
                var convertedName = common.convertToTitle(name);
                var levelOptions = value[1].slice(1).map(createLevelOption);
                levelOptions[levelOptions.length - 1].selected = true;
                var templateVars = {
                    'id': name,
                    'title': convertedName,
                    'levelContent': levelOptions,
                    'rowId': type + '-building-level-' + value[3],
                    'tabIndexValue': typesHelper[type].tabIndex + value[3]
                };

                if (type === 'light' || type === 'dark') {
                    var i;
                    var barracksTimes = [];
                    for (i = 1; i <= types.buildings[type].count; i++) {
                        barracksTimes.push({
                            'barrackQuantityId': 'quantity-' + name + '-' + i
                        });
                    }
                    templateVars.barracksTimes = barracksTimes;

                    templateVars.subtractId = name + '-subtract';
                    templateVars.tabIndexSubtract = typesHelper[type].tabIndex + 100 + value[3];
                }

                rows.push(templateVars);
            });

            basicInfo.objects = rows;

            if (['light', 'dark'].indexOf(type) !== -1) {
                var i = 0;
                basicInfo.barracks = [];
                while (++i <= types.buildings[type].count) {
                    var barrack = {'index': i, 'options': [], 'isFirst': (i === 1)};
                    var j = -1;
                    while (++j <= types.buildings[type].maxLevel) {
                        if (i === 1 && j === 0 && types.buildings[type].firstRequired) {
                            continue;
                        }
                        barrack.options.push({'text': j});
                    }
                    barrack.options[barrack.options.length - 1].selected = true;

                    basicInfo.barracks.push(barrack);
                }
            }

            vars.types.push(basicInfo);
        });


        vars.armyCamps = [];
        armyCamps.base.forEach(function(value) {
            vars.armyCamps.push({'value': value});
        });
        for (var value = armyCamps.base[armyCamps.base.length - 1];
             value <= armyCamps.max;
             value += armyCamps.step) {
            vars.armyCamps.push({'value': value});
        }
        vars.armyCamps[vars.armyCamps.length - 1].selected = true;

        vars.spellFactory = [];
        var i = -1;
        while (++i <= types.buildings.spells.max) {
            vars.spellFactory.push({'value': i});
        }
        vars.spellFactory[vars.spellFactory.length - 1].selected = true;
    });

};
