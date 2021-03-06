if (typeof exports !== 'undefined') {
    var part = require('../part.js');
}

part('types', function() {
    'use strict';

    var data = {
        'light': {
            'Barbarian': [20, [0, 25, 40, 60, 100, 150, 200, 250], 1, 1, {1: 1, 3: 2, 5: 3, 7: 4, 8: 5, 9: 6, 10: 7}],
            'Archer': [25, [0, 50, 80, 120, 200, 300, 400, 500], 1, 2, {1: 1, 3: 2, 5: 3, 7: 4, 8: 5, 9: 6, 10: 7}],
            'Giant': [120, [0, 250, 750, 1250, 1750, 2250, 3000, 3500], 5, 3, {1: 1, 3: 2, 6: 3, 7: 4, 8: 5, 9: 6, 10: 7}],
            'Goblin': [30, [0, 25, 40, 60, 80, 100, 150, 200], 1, 4, {1: 1, 4: 2, 5: 3, 7: 4, 8: 5, 9: 6, 10: 7}],
            'Wall_Breaker': [60, [0, 1000, 1500, 2000, 2500, 3000, 3500], 2, 5, {1: 1, 3: 1, 4: 2, 6: 3, 7: 4, 8: 5, 10: 6}],
            'Balloon': [300, [0, 2000, 2500, 3000, 3500, 4000, 4500], 5, 6, {1: 1, 4: 2, 6: 3, 7: 4, 8: 5, 9: 6}],
            'Wizard': [300, [0, 1500, 2000, 2500, 3000, 3500, 4000], 4, 7, {1: 1, 5: 2, 6: 3, 7: 4, 8: 5, 10: 6}],
            'Healer': [600, [0, 5000, 6000, 8000, 10000], 14, 8, {1: 1, 6: 1, 7: 2, 8: 3, 9: 4}],
            'Dragon': [900, [0, 25000, 29000, 33000, 37000, 42000], 20, 9, {1: 1, 7: 2, 8: 3, 9: 4, 10: 5}],
            'P-E-K-K-A-': [900, [0, 28000, 32000, 36000, 40000, 45000], 25, 10, {1: 1, 8: 3, 10: 5}]
        },
        'dark': {
            'Minion': [45, [0, 6, 7, 8, 9, 10, 11, 12], 2, 1, {1: 1, 7: 2, 8: 4, 9: 5, 10: 6, 11: 7}],
            'Hog_Rider': [120, [0, 40, 45, 52, 58, 65, 90], 5, 2, {1: 1, 7: 2, 8: 4, 9: 5, 10: 6}],
            'Valkyrie': [300, [0, 70, 100, 130, 160, 190], 8, 3, {1: 1, 7: 1, 8: 2, 9: 4, 10: 5}],
            'Golem': [900, [0, 450, 525, 600, 675, 750], 30, 4, {1: 1, 8: 2, 9: 4, 10: 5}],
            'Witch': [600, [0, 250, 350, 450], 12, 5, {1: 1, 9: 2, 11: 3}],
            'Lava_Hound': [900, [0, 390, 450, 510], 30, 6, {1: 1, 9: 2, 10: 3}],
            'Bowler': [300, [0, 130, 150, 170], 8, 7, {1: 1, 10: 2, 11: 3}]
        },
        'light-spells': {
            'Lightning': [600, [0, 15000, 16500, 18000, 20000, 22000, 24000, 26000], 2, 1, {1: 1, 5: 4, 8: 5, 9: 6, 10: 7}],
            'Healing': [600, [0, 15000, 16500, 18000, 20000, 22000, 24000], 2, 2, {1: 1, 6: 3, 7: 4, 8: 5, 9: 6}],
            'Rage': [600, [0, 23000, 25000, 27000, 30000, 33000], 2, 3, {1: 1, 7: 4, 8: 5}],
            'Jump': [600, [0, 23000, 27000, 31000], 2, 4, {1: 1, 9: 2, 10: 3}],
            'Freeze': [600, [0, 26000, 29000, 31000, 33000, 35000], 2, 4, {1: 1, 9: 1, 10: 5}]
        },
        'dark-spells': {
            'Poison': [300, [0, 95, 110, 125, 140], 1, 1, {1: 1, 8: 2, 9: 3, 10: 4}],
            'Earthquake': [300, [0, 125, 140, 160, 180], 1, 2, {1: 1, 8: 2, 9: 3, 10: 4}],
            'Haste': [300, [0, 80, 85, 90, 95], 1, 3, {1: 1, 9: 2, 10: 4}]
        }
    };

    return {
        'data': data,
        'iterateTree': function(callback) {
            Object.keys(data).forEach(function(type) {
                Object.keys(data[type]).forEach(function(name) {
                    callback(type, name, data[type][name]);
                });
            });
        },
        'buildings': {
            'light': {
                'count': 4,
                'queue': [0, 20, 25, 30, 35, 40, 45, 50, 55, 60, 75],
                'maxLevel': 10,
                'firstRequired': true,
                'th': {
                    1: [3, 0, 0, 0],
                    2: [4, 4, 0, 0],
                    3: [5, 5, 0, 0],
                    4: [6, 6, 6, 0],
                    5: [7, 7, 7, 0],
                    6: [8, 8, 8, 0],
                    7: [9, 9, 9, 9],
                    8: [10, 10, 10, 10]
                }
            },
            'dark': {
                'count': 2,
                'queue': [0, 40, 50, 60, 70, 80, 90, 100],
                'maxLevel': 7,
                'th': {
                    1: [0, 0],
                    7: [2, 0],
                    8: [4, 4],
                    9: [6, 6],
                    10: [7, 7]
                }
            },
            'light-spells': {
                'maxLevel': 5,
                'th': {
                    1: 0,
                    5: 1,
                    6: 2,
                    7: 3,
                    9: 4,
                    10: 5
                }
            },
            'dark-spells': {
                'maxLevel': 3,
                'th': {
                    1: 0,
                    8: 2,
                    9: 3
                }
            }
        }
    };

});
