part('savedData', ['common'], function(common) {
    'use strict';

    var saveMappingKeys = [
        'barracks-levels-1',
        'barracks-levels-2',
        'barracks-levels-3',
        'barracks-levels-4',
        'dark-barracks-levels-1',
        'dark-barracks-levels-2',
        'armyCamps',
        'spellFactoryLevel',
        'Barbarian',
        'Archer',
        'Goblin',
        'Giant',
        'Wall_Breaker',
        'Balloon',
        'Wizard',
        'Healer',
        'Dragon',
        'P-E-K-K-A-',
        'Barbarian-level',
        'Archer-level',
        'Goblin-level',
        'Giant-level',
        'Wall_Breaker-level',
        'Balloon-level',
        'Wizard-level',
        'Healer-level',
        'Dragon-level',
        'P-E-K-K-A--level',
        'Lightning',
        'Healing',
        'Rage',
        'Jump',
        'Lightning-level',
        'Healing-level',
        'Rage-level',
        'Jump-level',
        'Minion',
        'Hog_Rider',
        'Valkyrie',
        'Golem',
        'Minion-level',
        'Hog_Rider-level',
        'Valkyrie-level',
        'Golem-level',
        'Freeze',
        'Freeze-level',
        'Witch',
        'Witch-level'
    ];

    var dataObjectToArray = function(dataObject) {
        var dataArray = [];

        saveMappingKeys.forEach(function(key) {
            var value;
            if (dataObject.hasOwnProperty(key)) {
                value = dataObject[key];
            } else {
                value = 0;
            }
            dataArray.push(value);
        });

        return dataArray;
    };

    var dataArrayToObject = function(dataArray) {
        var dataObject = {};

        saveMappingKeys.forEach(function(key, index) {
            if (dataArray[index] === undefined) {
                dataObject[key] = 0;
            } else {
                dataObject[key] = dataArray[index];
            }
        });

        return dataObject;
    };

    var DataStorage = function(key) {
        this.key = key;

        this.load = function(isLoadSource) {
            var data = localStorage.getItem(this.key);
            data = (data && JSON.parse(data)) || [];
            if (isLoadSource) {
                return data;
            }
            data = data.map(dataArrayToObject);
            return data;
        };

        this.save = function(dataObjects) {
            var dataArrays = dataObjects.map(dataObjectToArray);
            localStorage.setItem(this.key, JSON.stringify(dataArrays));
        };
    };

    var storage = new DataStorage('data4');
    var all = storage.load().map(function(entry) {
        return new common.Dict(entry);
    });

    return {
        'storage': storage,
        'all': all,
        'current': all[0] || new common.Dict({}),
        'save': function() {
            this.all[0] = this.current;
            storage.save(this.all.map(function(entry) {
                return entry.getAll();
            }));
        },
        'dataArrayToObject': dataArrayToObject,
        'dataObjectToArray': dataObjectToArray
    };
});