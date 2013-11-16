(function(mk) {

    'use strict';

    mk.calc = {};

    if (typeof exports !== 'undefined') {
        module.exports = mk;
    }

    mk.calc.types = {
        'units': {
            'Barbarian': [20, [25, 40, 60, 80, 100, 150], 1, 1, {1: 1, 3: 2, 5: 3, 7: 4, 8: 5, 9: 6}],
            'Archer': [25, [50, 80, 120, 160, 200, 300], 1, 2, {1: 1, 3: 2, 5: 3, 7: 4, 8: 5, 9: 6}],
            'Goblin': [30, [25, 40, 60, 80, 100, 150], 1, 3, {1: 1, 3: 2, 5: 3, 7: 4, 8: 5, 10: 6}],
            'Giant': [120, [500, 1000, 1500, 2000, 2500, 3000], 5, 4, {1: 1, 2: 1, 4: 2, 6: 3, 7: 4, 8: 5, 9: 6}],
            'Wall_Breaker': [120, [1000, 1500, 2000, 2500, 3000, 3500], 2, 5, {1: 1, 3: 1, 4: 2, 6: 3, 7: 4, 8: 5, 10: 6}],
            'Balloon': [480, [2000, 2500, 3000, 3500, 4000, 4500], 5, 6, {1: 1, 4: 2, 6: 3, 7: 4, 8: 5, 9: 6}],
            'Wizard': [480, [1500, 2000, 2500, 3000, 3500, 4000], 4, 7, {1: 1, 5: 2, 6: 3, 7: 4, 8: 5, 10: 6}],
            'Healer': [900, [5000, 6000, 8000, 10000], 14, 8, {1: 1, 6: 1, 7: 2, 8: 3, 9: 4}],
            'Dragon': [1800, [25000, 30000, 36000, 42000], 20, 9, {1: 1, 7: 2, 8: 3, 10: 4}],
            'P-E-K-K-A-': [2700, [30000, 35000, 42000, 50000], 25, 10, {1: 1, 8: 3, 10: 4}]
        },
        'dark': {
            'Minion': [45, [6, 7, 8, 9, 10], 2, 1, {1: 1, 7: 2, 8: 4, 9: 5}],
            'Hog Rider': [120, [30, 35, 40, 45, 50], 5, 2, {1: 1, 7: 2, 8: 4, 9: 5}],
            'Valkyrie': [900, [70, 100, 130, 160], 8, 3, {1: 1, 7: 1, 8: 2, 9: 4}],
            'Golem': [2700, [450, 525, 600, 675, 750], 30, 4, {1: 1, 8: 2, 9: 4, 10: 5}],
            'Witch': [1200, [250, 350], 12, 5, {1: 1, 9: 2}]
        },
        'spells': {
            'Lightning': [1800, [15000, 16500, 18000, 20000, 22000, 24000], 1, 1, {1: 1, 5: 4, 8: 5, 10: 6}],
            'Healing': [1800, [15000, 16500, 18000, 20000, 22000, 24000], 1, 2, {1: 1, 6: 3, 7: 4, 8: 5, 9: 6}],
            'Rage': [2700, [23000, 25000, 27000, 30000, 33000], 1, 3, {1: 1, 7: 4, 8: 5}],
            'Jump': [2700, [23000, 29000], 1, 4, {1: 1, 9: 2}],
            'Freeze': [2700, [26000, 29000, 31000, 33000], 1, 5, {1: 1, 10: 4}]
        }
    };

    mk.calc.armyCampsData = {
        'base': [20, 40, 50],
        'step': 5,
        'max': 240,
        'th': {
            1: 20,
            2: 30,
            3: 70,
            4: 80,
            5: 135,
            6: 150,
            7: 200,
            9: 220,
            10: 240
        }
    };

    mk.calc.barracksData = {
        'units': {
            'prefix': 'barracks',
            'count': 4,
            'queue': [0, 20, 25, 30, 35, 40, 45, 50, 55, 60, 75],
            'maxLevel': 10,
            'firstRequired': true,
            'th': {
                1: 3,
                2: 4,
                3: 5,
                4: 6,
                5: 7,
                6: 8,
                7: 9,
                8: 10
            }
        },
        'dark': {
            'prefix': 'dark-barracks',
            'count': 2,
            'queue': [0, 40, 50, 60, 70, 80],
            'maxLevel': 5,
            'th': {
                1: 0,
                7: 2,
                8: 4,
                9: 5
            }
        }
    };

    mk.calc.spellFactoryData = {
        'max': 5,
        'th': {
            1: 0,
            5: 1,
            6: 2,
            7: 3,
            9: 4,
            10: 5
        }
    };

    mk.calc.saveMappingKeys = [
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
        'Barbarian-subtract',
        'Archer-subtract',
        'Goblin-subtract',
        'Giant-subtract',
        'Wall_Breaker-subtract',
        'Balloon-subtract',
        'Wizard-subtract',
        'Healer-subtract',
        'Dragon-subtract',
        'P-E-K-K-A--subtract',
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
        'Minion-subtract',
        'Hog Rider-subtract',
        'Valkyrie-subtract',
        'Golem-subtract',
        'Freeze',
        'Freeze-level',
        'Witch',
        'Witch-level',
        'Witch-subtract',
        'settingsMode'
    ];

    mk.calc.dataObjectToArray = function(dataObject) {
        var dataArray = [];

        mk.calc.saveMappingKeys.forEach(function(key) {
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

        mk.calc.saveMappingKeys.forEach(function(key, index) {
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
            data = data.map(function(dataArray) {
                return mk.calc.dataArrayToObject(dataArray);
            });
            return data;
        };

        this.save = function(dataObjects) {
            var dataArrays = dataObjects.map(function(dataObject) {
                return mk.calc.dataObjectToArray(dataObject);
            });
            localStorage.setItem(this.key, JSON.stringify(dataArrays));
        };
    };

    var BarracksContainer = function(data) {
        this.barracks = [];
        this.data = data;

        if (typeof window !== 'undefined') {
            var i = 0;
            while (++i <= this.data.count) {
                var barrack = mk.$id(this.data.prefix + '-levels-' + i);
                var j = -1;
                var options = [];
                while (++j <= this.data.maxLevel) {
                    if (i === 1 && j === 0 && data.firstRequired) {
                        continue;
                    }
                    var selected = '';
                    if (j === this.data.maxLevel) {
                        selected = ' selected="selected"';
                    }
                    options.push('<option value="' + j + '"' + selected + '>' + j + '</option>');
                }
                barrack.innerHTML = options.join('');
                this.barracks.push(barrack);
            }
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
                    'queueLength': this.data.queue[el.value]
                };
            }, this);
        };

        this.getQueue = function() {
            return this.barracks.map(function(el) {
                return {
                    'num': el.getAttribute('id').slice(-1),
                    'time': 0,
                    'space': 0,
                    'maxSpace': this.data.queue[el.value],
                    'units': {},
                    'level': parseInt(el.value, 10)
                };
            }, this);
        };

        this.getElements = function() {
            return this.barracks;
        };

        this.getMaxCount = function() {
            return this.data.count;
        };

        this.getCapLevel = function() {
            return this.data.maxLevel;
        };

        this.getActiveCount = function() {
            return this.barracks.filter(function(b){
                return b.value > 0;
            }).length;
        };

        this.setLevels = function(level, callback) {
            this.barracks.forEach(function(el) {
                el.value = level;
                callback(el);
            });
        };

    };

    if (typeof window !== 'undefined') {
        mk.calc.savedDataStorage = new DataStorage('data3');
        mk.calc.savedDataAll = new mk.MultiDict(mk.calc.savedDataStorage.load());
        mk.calc.savedData = mk.calc.savedDataAll.retrieve(0);

        mk.calc.armyCamps = mk.$id('army-camps');
        mk.calc.spellFactoryLevel = mk.$id('spell-factory-level');
    }

    mk.calc.allBarracks = {};
    mk.objectIterate(mk.calc.barracksData, function(type, data) {
        mk.calc.allBarracks[type] = new BarracksContainer(data);
    });

}(typeof exports !== 'undefined' ? require('./mk.common').mk : window.mk));
