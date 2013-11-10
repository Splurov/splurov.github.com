(function(mk){

    'use strict';

    var optimizeIos = function(callback) {
        if (window.platformIos) {
            (window.requestAnimationFrame || window.webkitRequestAnimationFrame)(callback);
        } else {
            callback();
        }
    };

    mk.calc.typesSortedLevel = {};
    mk.objectIterate(mk.calc.types, function(type, items) {
        mk.calc.typesSortedLevel[type] = [];
        mk.objectIterate(items, function(name, objects) {
            mk.calc.typesSortedLevel[type].unshift(objects.concat(name));
        });
    });

    var currentSpace = {
        'units': 0,
        'dark': 0
    };

    var updateBarracksHeaders = function(type) {
        mk.calc.allBarracks[type].getAllNormalized().forEach(function(barrackData, barrackIndex) {
            var header = '';
            if (parseInt(barrackData.level, 10) !== 0) {
                header = barrackData.queueLength;
            }
            document.getElementById(type + '-barrack-header-' + (barrackIndex + 1)).textContent = header;
        });
    };

    var setQuantityAndSpace = function(maxSpace, totalSpace, type) {
        var spaceDiff = maxSpace - totalSpace;
        if (spaceDiff < 0) {
            spaceDiff = '<span class="limit-exceeded">' + spaceDiff + '</span>';
        }
        document.getElementById(type + '-quantity').innerHTML = '(' + spaceDiff + ' free)';

        var space = totalSpace;
        if (totalSpace > maxSpace) {
            space = '<span class="limit-exceeded">' + totalSpace + '</span>';
        }
        space = space + ' / ' + (type === 'units' ? '': maxSpace);
        document.getElementById(type + '-space').innerHTML = space;

    };

    var suitableBarracksSort = function(a, b) {
        // minimum time first
        if (a.time < b.time) {
            return -1;
        }
        if (a.time > b.time) {
            return 1;
        }

        // minimum space first
        if (a.space < b.space) {
            return -1;
        }
        if (a.space > b.space) {
            return 1;
        }

        // minimum max space first
        if (a.maxSpace < b.maxSpace) {
            return -1;
        }
        if (a.maxSpace > b.maxSpace) {
            return 1;
        }

        return 0;
    };


    var barracksMinLevelSort = function(a, b) {
        // minimum level first
        if (a.level < b.level) {
            return -1;
        }
        if (a.level > b.level) {
            return 1;
        }

        return suitableBarracksSort(a, b);
    };

    var getSuitableBarrack = function(barracks,
                                      requiredLevel,
                                      requiredSpace,
                                      requiredTime,
                                      avgTime) {
        var suitable = barracks.filter(function(barrack) {
            return barrack.level >= requiredLevel && (barrack.space + requiredSpace) <= barrack.maxSpace;
        });

        if (!suitable.length) {
            return null;
        }

        if (suitable.length > 1) {
            if (requiredSpace === 1) {
                var timeSuitable = suitable.filter(function(barrack) {
                    return (barrack.time + requiredTime) <= avgTime;
                });
                if (timeSuitable.length) {
                    if (timeSuitable.length > 1) {
                        timeSuitable.sort(barracksMinLevelSort);
                    }
                    return timeSuitable[0];
                }
            }

            suitable.sort(suitableBarracksSort);
        }

        return suitable[0];
    };

    mk.calc.fillBarracks = function(barracksQueue, unitsDistribution, avgTime) {
        var stopDistribution = false;

        var udIndex; // ud - units distribution
        var udLength;
        for (udIndex = 0, udLength = unitsDistribution.length; udIndex < udLength; udIndex++) {
            var kit = unitsDistribution[udIndex];
            var kitLevel = kit[2];
            var kitTime = kit[3];
            var kitSpace = kit[4];
            var i;
            var barrack = null;
            for (i = 0; i < kit[1]; i++) {
                var isGetBarrack = true;
                if (barrack) {
                    var newTime = barrack.time + kitTime;
                    var newSpace = barrack.space + kitSpace;
                    if (kitSpace === 1 && newTime <= avgTime && newSpace <= barrack.maxSpace) {
                        isGetBarrack = false;
                    }
                }

                if (isGetBarrack) {
                    barrack = getSuitableBarrack(
                        barracksQueue,
                        kitLevel,
                        kitSpace,
                        kitTime,
                        avgTime
                    );
                }

                if (barrack === null) {
                    stopDistribution = true;
                    break;
                }

                if (barrack.units[kit[0]]) {
                    barrack.units[kit[0]]++;
                } else {
                    barrack.units[kit[0]] = 1;
                }

                barrack.time += kitTime;
                barrack.space += kitSpace;
            }
        }

        if (!stopDistribution) {
            var firstBarrackLevel = barracksQueue[0].level;
            var nums = [];
            if (barracksQueue.every(function(barrack) {
                if (barrack.level !== 0) {
                    nums.push(barrack.num);
                }
                return (barrack.level === firstBarrackLevel || barrack.level === 0);
            })) {
                barracksQueue.sort(function(a, b) {
                    return b.time - a.time;
                });
                barracksQueue.forEach(function(barrack, index) {
                    if (barrack.level !== 0) {
                        barrack.num = nums[index];
                    }
                });
            }
        }

        return !stopDistribution;
    };

    var populateDistribution = function(fillSuccess, type, barracksQueue) {
        var bqIndex;
        var bqLength = barracksQueue.length;
        var times = [];
        if (fillSuccess) {
            document.getElementById(type + '-barracks-exceeded').style.display = 'none';
            var maxTime = 0;
            var maxNum = 1;

            for (bqIndex = 0; bqIndex < bqLength; bqIndex++) {
                var barrack = barracksQueue[bqIndex];

                var unitIndex;
                for (unitIndex in barrack.units) {
                    if (barrack.units[unitIndex] > 0) {
                        document.getElementById(
                            'quantity-' +
                            mk.calc.typesSortedLevel[type][unitIndex][4] +
                            '-' +
                            barrack.num
                        ).textContent = '×' + barrack.units[unitIndex];
                    }
                }

                if (barrack.time > maxTime) {
                    maxTime = barrack.time;
                    maxNum = parseInt(barrack.num, 10);
                }

                times[barrack.num] = (barrack.time ? mk.getFormattedTime(barrack.time) : '');

                var spaceData = '';
                if (barrack.space !== 0) {
                    spaceData = barrack.space + ' / ';
                }
                document.getElementById(type + '-barrack-space-' + barrack.num).textContent = spaceData;
            }
            times.forEach(function(time, num) {
                var barrackEl = document.getElementById(type + '-time-barrack-' + num);
                if (num === maxNum) {
                    barrackEl.innerHTML = '<span class="result">' + time + '</span>';
                } else {
                    barrackEl.textContent = time;
                }
            });
        } else {
            document.getElementById(type + '-barracks-exceeded').style.display = '';
            var spaces = [];
            var sumSpace = 0;
            for (bqIndex = 0; bqIndex < bqLength; bqIndex++) {
                var barrack = barracksQueue[bqIndex];
                document.getElementById(type + '-time-barrack-' + barrack.num).textContent = '';

                spaces[barrack.num] = barrack.space;
                sumSpace += barrack.space;
            }

            var firstIteration = true;
            spaces.forEach(function(space, num) {
                var barrackSpaceEl = document.getElementById(type + '-barrack-space-' + num);
                if (space === 0) {
                    barrackSpaceEl.textContent = '';
                } else {
                    if (firstIteration) {
                        space += currentSpace[type] - sumSpace;
                        barrackSpaceEl.innerHTML = '<span class="limit-exceeded result">' + space + '</span> / ';

                        firstIteration = false;
                    } else {
                        barrackSpaceEl.textContent = space + ' / ';
                }
                }
            });
        }
    };

    var calculateItems = function(type, params) {
        var clIndex; // cl - cap level
        for (clIndex = params.capLevel; clIndex >= 1; clIndex--) {
            document.getElementById(
                type +
                '-building-level-' +
                clIndex
            ).style.display = (clIndex > params.levelValue ? 'none' : '');
        }

        var totalCost = 0;
        var subtractedCost = 0;
        var totalSpace = 0;
        var totalTime = 0;
        var maxUnitTime = 0;
        var distribution = [];

        var tsIndex; // ts - types sorted
        var tsLength;
        for (tsIndex = 0, tsLength = mk.calc.typesSortedLevel[type].length; tsIndex < tsLength; tsIndex++) {
            var value = mk.calc.typesSortedLevel[type][tsIndex];
            if (value[3] > params.levelValue) {
                continue;
            }

            var name = value[4];
            var item = document.getElementById(name);

            var quantity = parseInt(item.value, 10) || 0;
            if (quantity < 0) {
                quantity = 0;
            }
            if (item.value !== '') {
                item.value = quantity;
            }

            var levelId = name + '-level';
            var levelEl = document.getElementById(levelId);
            var levelSelectedIndex = levelEl.selectedIndex;
            var costPerItem = levelEl.value;
            var summaryCost = (costPerItem * quantity);

            if (params.allCosts ||
                 mk.calc.savedData.get(name) !== quantity ||
                 mk.calc.savedData.get(levelId) !== levelSelectedIndex) {
                document.getElementById(name + '-summary').textContent = (summaryCost ?
                                                                          mk.numberFormat(summaryCost) : '');
            }

            totalCost += summaryCost;

            totalSpace += (value[2] * quantity);
            if (type === 'spells') {
                totalTime += (value[0] * quantity);
            } else {
                var mcIndex; // mc - max count
                for (mcIndex = 1; mcIndex <= mk.calc.allBarracks[type].getMaxCount(); mcIndex++) {
                    document.getElementById('quantity-' + name + '-' + mcIndex).textContent = '';
                }

                var subtractId = name + '-subtract';
                var subtract = document.getElementById(subtractId);
                var subtractQuantity = parseInt(subtract.value, 10) || 0;
                if (subtractQuantity < 0) {
                    subtractQuantity = 0;
                }
                if (subtract.value !== '') {
                    subtract.value = subtractQuantity;
                }

                if (subtract.value > 0) {
                    mk.Events.trigger('goal', {
                        'id': 'SUBTRACT'
                    }, true);
                }

                var totalQuantity = quantity - subtractQuantity;
                if (totalQuantity < 0) {
                    totalQuantity = 0;
                }
                if (totalQuantity > 0) {
                    distribution.push([
                        tsIndex,
                        quantity - subtractQuantity,
                        value[3], // level
                        value[0], // time
                        value[2] // space
                    ]);
                    maxUnitTime = Math.max(maxUnitTime, value[0]);
                    totalTime += (value[0] * totalQuantity);
                }

                subtractedCost += (costPerItem * totalQuantity);

                mk.calc.savedData.set(subtractId, subtractQuantity);
            }

            mk.calc.savedData.set(name, quantity);
            mk.calc.savedData.set(levelId, levelSelectedIndex);
        }

        document.getElementById(type + '-cost').textContent = mk.numberFormat(totalCost);

        if (type === 'spells') {
            setQuantityAndSpace(params.space, totalSpace, type);
            if (totalTime > 0) {
                document.getElementById(type + '-time').textContent = mk.getFormattedTime(totalTime, true);
            }
        } else {
            var barracksQueue = mk.calc.allBarracks[type].getQueue();
            var avgTime = Math.max(Math.ceil(totalTime / mk.calc.allBarracks[type].getActiveCount()), maxUnitTime);

            var fillSuccess = mk.calc.fillBarracks(barracksQueue, distribution, avgTime);

            currentSpace[type] += totalSpace;

            optimizeIos(function(fillSuccess, type, barracksQueue) {
                populateDistribution(fillSuccess, type, barracksQueue);
            }.bind(null, fillSuccess, type, barracksQueue));

            var subtractedCostEl = document.getElementById(type + '-subtracted-cost');
            if (subtractedCost === totalCost) {
                subtractedCostEl.textContent = '';
            } else {
                subtractedCostEl.innerHTML = '− ' + mk.numberFormat(totalCost - subtractedCost) +
                                             ' = <span class="result">' + mk.numberFormat(subtractedCost) + '</span>';
            }
        }
    };

    var calculate = function(params) {
        if (params.type === 'all' || params.type !== 'spells') {

            if (params.type === 'all' || params.type === 'barrack-units') {
                updateBarracksHeaders('units');
            }

            if (params.type === 'all' || params.type === 'barrack-dark') {
                updateBarracksHeaders('dark');
            }

            var armyCampsSpace = parseInt(mk.calc.armyCamps.value, 10);

            if (params.type === 'all' || params.type === 'units' || params.type === 'barrack-units') {
                currentSpace.units = 0;
                calculateItems('units', {
                    'levelValue': mk.calc.allBarracks.units.getMaxLevel(),
                    'capLevel': mk.calc.allBarracks.units.getCapLevel(),
                    'allCosts': params.allCosts
                });
            }

            if (params.type === 'all' || params.type === 'dark' || params.type === 'barrack-dark') {
                currentSpace.dark = 0;
                calculateItems('dark', {
                    'levelValue': mk.calc.allBarracks.dark.getMaxLevel(),
                    'capLevel': mk.calc.allBarracks.dark.getCapLevel(),
                    'allCosts': params.allCosts
                });
            }

            var togetherSpace = currentSpace.units + currentSpace.dark;
            setQuantityAndSpace(armyCampsSpace, togetherSpace, 'units');
            setQuantityAndSpace(armyCampsSpace, togetherSpace, 'dark');

            mk.calc.savedData.set('armyCamps', armyCampsSpace);

            mk.calc.allBarracks.units.updateSavedData();
            mk.calc.allBarracks.dark.updateSavedData();
        }

        if (params.type === 'all' || params.type === 'spells') {
            var spellFactoryLevel = parseInt(mk.calc.spellFactoryLevel.value, 10);
            calculateItems('spells', {
                'levelValue': spellFactoryLevel,
                'space': spellFactoryLevel,
                'capLevel': mk.calc.spellFactoryData.max,
                'allCosts': params.allCosts
            });

            mk.calc.savedData.set('spellFactoryLevel', mk.calc.spellFactoryLevel.selectedIndex);
        }

        mk.calc.savedDataAll.update(0, mk.calc.savedData);
        mk.calc.savedDataStorage.save(mk.calc.savedDataAll.getAll());

        mk.Events.trigger('calculated');
    };

    mk.Events.listen('calculate', calculate);

}(window.mk));