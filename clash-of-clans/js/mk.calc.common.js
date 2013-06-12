(function(window, document, mk) {

    'use strict';

    mk.calc = {};

    mk.calc.types = {
        'units': {
            'Barbarian': [20, [25, 40, 60, 80, 100, 150], 1, 1],
            'Archer': [25, [50, 80, 120, 160, 200, 300], 1, 2],
            'Goblin': [30, [25, 40, 60, 80, 100], 1, 3],
            'Giant': [120, [500, 1000, 1500, 2000, 2500, 3000], 5, 4],
            'Wall_Breaker': [120, [1000, 1500, 2000, 2500, 3000], 2, 5],
            'Balloon': [600, [2000, 2500, 3000, 3500, 4000, 4500], 5, 6],
            'Wizard': [600, [1500, 2000, 2500, 3000, 3500], 4, 7],
            'Healer': [900, [5000, 6000, 8000, 10000], 14, 8],
            'Dragon': [1800, [25000, 30000, 36000, 42000], 20, 9],
            'P-E-K-K-A-': [2700, [30000, 35000, 42000], 25, 10]
        },
        'spells': {
            'Lightning': [1800, [15000, 16500, 18000, 20000, 22000], 1, 1],
            'Healing': [1800, [20000, 22000, 24000, 26500, 29000], 1, 2],
            'Rage': [2700, [30000, 33000, 36000, 40000, 44000], 1, 3],
            'Jump': [2700, [30000, 38000], 1, 4]
        },
        'dark': {
            'Minion': [45, [6, 7, 8, 9, 10], 2, 1],
            'Hog Rider': [300, [30, 35, 40, 45, 50], 6, 2],
            'Valkyrie': [900, [100, 120, 140, 160], 8, 3],
            'Golem': [2700, [450, 525, 600, 675, 750], 30, 4]
        }
    };

    var saveMappingKeys = [
        'barracks-levels-1',
        'barracks-levels-2',
        'barracks-levels-3',
        'barracks-levels-4',
        'dark-barracks-levels-1',
        'dark-barracks-levels-2',
        'armyCamps',
        'spellFactoryLevel'
    ];
    mk.objectIterate(mk.calc.types, function(type, items) {
        mk.objectIterate(items, function(name) {
            saveMappingKeys.push(name);
        });
        mk.objectIterate(items, function(name) {
            saveMappingKeys.push(name + '-level');
        });
        mk.objectIterate(items, function(name) {
            saveMappingKeys.push(name + '-subtract');
        });
    });

    mk.calc.dataObjectToArray = function(dataObject) {
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

    mk.calc.dataArrayToObject = function(dataArray) {
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

    mk.calc.DataStorage = function(key) {
        this.key = key;

        this.load = function(isLoadSource) {
            var data = window.localStorage.getItem(this.key);
            data = (data && JSON.parse(data)) || [];
            if (isLoadSource) {
                return data;
            }
            data = data.map(function(dataArray) {
                return mk.calc.dataArrayToObject(dataArray);
            });
            return data;
        };

        this.save = function(dataObjects) {
            var dataArrays = dataObjects.map(function(dataObject) {
                return mk.calc.dataObjectToArray(dataObject);
            });
            window.localStorage.setItem(this.key, JSON.stringify(dataArrays));
        };
    };

    mk.calc.BarracksContainer = function(maxCount, selectName, queueLengths) {
        this.barracks = [];
        this.maxCount = maxCount;
        this.queueLengths = queueLengths;

        var i;
        for (i = 1; i <= this.maxCount; i++) {
            var barrack = document.getElementById(selectName + '-' + i);
            this.barracks.push(barrack);
        }

        this.setDefaults = function() {
            this.barracks.forEach(function(el) {
                var saved = mk.calc.savedData.get(el.getAttribute('id'));
                if (saved !== undefined && saved !== null) {
                    el.options[saved].selected = true;
                }
            });
        };

        this.updateSavedData = function() {
            this.barracks.forEach(function(el) {
                mk.calc.savedData.set(el.getAttribute('id'), el.selectedIndex);
            });
        };

        this.getMaxLevel = function() {
            return Math.max.apply(null, this.barracks.map(function(el) {
                return parseInt(el.value, 10);
            }));
        };

        this.getAllNormalized = function() {
            return this.barracks.map(function(el) {
                return {
                    'level': parseInt(el.value, 10),
                    'queueLength': this.queueLengths[el.value]
                };
            }, this);
        };

        this.getQueue = function() {
            return this.barracks.map(function(el) {
                return {
                    'num': el.getAttribute('id').slice(-1),
                    'time': 0,
                    'space': 0,
                    'maxSpace': this.queueLengths[el.value],
                    'units': {},
                    'level': parseInt(el.value, 10)
                };
            }, this);
        };

        this.getElements = function() {
            return this.barracks;
        };

        this.getMaxCount = function() {
            return this.maxCount;
        };

        this.getCapLevel = function() {
            return this.barracks[0].options[this.barracks[0].options.length - 1].value;
        };

        this.getActiveCount = function() {
            return this.barracks.filter(function(b){
                return b.value > 0;
            }).length;
        };
    };

}(window, document, window.mk));
