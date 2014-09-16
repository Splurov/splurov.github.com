part('storage', [
    'common',
    'localStorageSet'
], function(common, localStorageSet) {
    'use strict';

    var saveMappingKeys = [
        'light-level-1',
        'light-level-2',
        'light-level-3',
        'light-level-4',
        'dark-level-1',
        'dark-level-2',
        'army-camps',
        'spells-level',
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
        'Witch-level',
        'favorite-title',
        'Lava_Hound',
        'Lava_Hound-level'
    ];

    var excludeIndexes = [
        saveMappingKeys.indexOf('favorite-title')
    ];

    var dataObjectToArray = function(dataObject) {
        var dataArray = [];

        saveMappingKeys.forEach(function(key) {
            var value;
            if (dataObject.hasOwnProperty(key)) {
                value = dataObject[key];
            } else {
                value = null;
            }
            dataArray.push(value);
        });

        return dataArray;
    };

    var dataArrayToObject = function(dataArray) {
        var dataObject = {};

        saveMappingKeys.forEach(function(key, index) {
            if (dataArray[index] === undefined) {
                dataObject[key] = null;
            } else {
                dataObject[key] = dataArray[index];
            }
        });

        return dataObject;
    };

    var storageKey = 'data5';

    var load = function(isLoadSource) {
        var data = localStorage.getItem(storageKey);
        data = (data && JSON.parse(data)) || [];
        if (isLoadSource) {
            return data;
        }
        data = data.map(dataArrayToObject);
        return data;
    };

    var all = load().map(function(entry) {
        return new common.Dict(entry);
    });

    return {
        'getForDiff': function() {
            var source = load(true);
            excludeIndexes.forEach(function(index) {
                source.forEach(function(item) {
                    item[index] = null;
                });
            });
            return source;
        },
        'excludeIndexes': excludeIndexes,
        'all': all,
        'current': all[0] || new common.Dict({}),
        'save': function() {
            all[0] = this.current;
            var dataObjects = all.map(function(entry) {
                return entry.getAll();
            });

            var dataArrays = dataObjects.map(dataObjectToArray);
            return localStorageSet(storageKey, JSON.stringify(dataArrays), (all.length - 1));
        },
        'dataArrayToObject': dataArrayToObject,
        'dataObjectToArray': dataObjectToArray
    };
});