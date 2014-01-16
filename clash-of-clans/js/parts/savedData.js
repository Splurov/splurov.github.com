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
        'Hog Rider',
        'Valkyrie',
        'Golem',
        'Minion-level',
        'Hog Rider-level',
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

    var MultiDict = function(entries) {
        this.entries = [];

        this.retrieve = function(i) {
            return this.entries[i] || new Dict({});
        };

        this.update = function(i, data) {
            this.entries[i] = data;
        };

        this.insert = function(data) {
            this.entries.push(new common.Dict(data));
        };

        this.remove = function(i) {
            this.entries.splice(i, 1);
        };

        this.getAll = function() {
            return this.entries.map(function(entry) {
                return entry.getAll();
            });
        };

        this.forEach = function(callback) {
            this.entries.forEach(callback);
        };

        this.getLength = function() {
            return this.entries.length;
        };

        entries.forEach(this.insert.bind(this));
    };

    var storage = new DataStorage('data4');
    var all = new MultiDict(storage.load());

    return {
        'storage': storage,
        'all': all,
        'current': all.retrieve(0),
        'save': function() {
            storage.save(all.getAll());
        },
        'dataArrayToObject': dataArrayToObject,
        'dataObjectToArray': dataObjectToArray
    };
});