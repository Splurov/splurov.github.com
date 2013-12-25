(function(){

    'use strict';

    var debounce = function(fn, delay) {
        var timer;
        return function() {
            var context = this;
            var args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function() {
                fn.apply(context, args);
            }, delay);
        };
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
            mk.$id(type + '-barrack-header-' + (barrackIndex + 1)).textContent = header;
        });
    };

    var setQuantityAndSpace = function(maxSpace, totalSpace, type) {
        var spaceDiff = maxSpace - totalSpace;
        if (spaceDiff < 0) {
            spaceDiff = '<span class="limit-exceeded">' + spaceDiff + '</span>';
        }
        mk.$id(type + '-quantity').innerHTML = '(' + spaceDiff + ' free)';

        var space = totalSpace;
        if (totalSpace > maxSpace) {
            space = '<span class="limit-exceeded">' + totalSpace + '</span>';
        }
        space = space + ' / ' + (type === 'units' ? '': maxSpace);
        mk.$id(type + '-space').innerHTML = space;

    };

    var suitableBarracksSort = function(a, b) {
        // minimum time first
        var aTime = a.getActualTime();
        var bTime = b.getActualTime();
        if (aTime < bTime) {
            return -1;
        }
        if (aTime > bTime) {
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
                    return (barrack.getActualTime() + requiredTime) <= avgTime;
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

        while (unitsDistribution.length) {
            var kit = unitsDistribution.shift();
            var kitIndex = kit[0];
            var kitQuantity = kit[1];
            var kitLevel = kit[2];
            var kitTime = kit[3];
            var kitSpace = kit[4];
            var barrack = null;
            while (kitQuantity--) {
                var isGetBarrack = true;
                if (barrack) {
                    var newTime = barrack.getActualTime() + kitTime;
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

                if (barrack.units[kitIndex]) {
                    barrack.units[kitIndex]++;
                } else {
                    barrack.units[kitIndex] = 1;
                }

                barrack.time += kitTime;
                barrack.space += kitSpace;
            }
        }

        if (!stopDistribution) {
            var firstBarrackLevel = barracksQueue[0].level;
            var firstBarrackBoosted = barracksQueue[0].isBoosted();
            var nums = [];
            if (barracksQueue.every(function(barrack) {
                if (barrack.level !== 0) {
                    nums.push(barrack.num);
                }
                return (
                    (barrack.level === firstBarrackLevel && barrack.isBoosted() === firstBarrackBoosted) ||
                    barrack.level === 0
                );
            })) {
                barracksQueue.sort(function(a, b) {
                    return b.getActualTime() - a.getActualTime();
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
        var times = [];
        if (fillSuccess) {
            mk.$id(type + '-barracks-exceeded').style.display = 'none';
            var maxTime = 0;
            var maxNum = 1;

            while (barracksQueue.length) {
                var barrack = barracksQueue.shift();

                for (var unitIndex in barrack.units) {
                    if (barrack.units[unitIndex] > 0) {
                        mk.$id(
                            'quantity-' +
                            mk.calc.typesSortedLevel[type][unitIndex][5] +
                            '-' +
                            barrack.num
                        ).textContent = '×' + barrack.units[unitIndex];
                    }
                }

                var actualTime = barrack.getActualTime();
                if (actualTime > maxTime) {
                    maxTime = actualTime;
                    maxNum = parseInt(barrack.num, 10);
                }

                var time = (actualTime ? mk.getFormattedTime(actualTime) : '');
                if (barrack.isBoosted()) {
                    time = '<span class="boosted">' + time + '</span>';
                }
                times[barrack.num] = time;

                var spaceData = '';
                if (barrack.maxSpace !== 0) {
                    spaceData = barrack.space + ' / ';
                }
                mk.$id(type + '-barrack-space-' + barrack.num).textContent = spaceData;
            }
            times.forEach(function(time, num) {
                var barrackEl = mk.$id(type + '-time-barrack-' + num);
                if (num === maxNum) {
                    time = '<span class="result">' + time + '</span>';
                }
                barrackEl.innerHTML = time;
            });
        } else {
            mk.$id(type + '-barracks-exceeded').style.display = '';
            var spaces = [];
            var sumSpace = 0;
            while (barracksQueue.length) {
                var barrack = barracksQueue.shift();
                mk.$id(type + '-time-barrack-' + barrack.num).textContent = '';

                spaces[barrack.num] = barrack.space;
                sumSpace += barrack.space;
            }

            var firstIteration = true;
            spaces.forEach(function(space, num) {
                var barrackSpaceEl = mk.$id(type + '-barrack-space-' + num);
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
    var populateDistributionDebounced = debounce(populateDistribution, 200);

    var calculateItems = function(type, params) {
        var clIndex = params.capLevel + 1;
        while (--clIndex > 0) {
            mk.$id(
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

        var tsIndex = -1; // ts - types sorted
        var tsLength = mk.calc.typesSortedLevel[type].length;
        while (++tsIndex < tsLength) {
            var value = mk.calc.typesSortedLevel[type][tsIndex];
            if (value[3] > params.levelValue) {
                continue;
            }

            var name = value[5];
            var item = mk.$id(name);

            var quantity = parseInt(item.value, 10) || 0;
            if (quantity < 0) {
                quantity = 0;
            }
            item.value = quantity || '';

            var levelId = name + '-level';
            var levelEl = mk.$id(levelId);
            var levelSelectedIndex = levelEl.selectedIndex;
            var costPerItem = levelEl.value;
            var summaryCost = (costPerItem * quantity);

            if (params.computeAll ||
                mk.calc.savedData.get(name) !== quantity ||
                mk.calc.savedData.get(levelId) !== levelSelectedIndex) {
                 mk.$id(name + '-summary').textContent = (summaryCost ? mk.numberFormat(summaryCost) : '');
            }

            totalCost += summaryCost;

            totalSpace += (value[2] * quantity);
            if (type === 'spells') {
                totalTime += (value[0] * quantity);
            } else {
                var mcIndex = 0; // mc - max count
                var mcLength = mk.calc.allBarracks[type].getMaxCount();
                while (++mcIndex <= mcLength) {
                    mk.$id('quantity-' + name + '-' + mcIndex).textContent = '';
                }

                var subtractId = name + '-subtract';
                var subtract = mk.$id(subtractId);
                var subtractQuantity = parseInt(subtract.value, 10) || 0;
                if (subtractQuantity < 0) {
                    subtractQuantity = 0;
                }
                subtract.value = subtractQuantity || '';

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
            }

            mk.calc.savedData.set(name, quantity);
            mk.calc.savedData.set(levelId, levelSelectedIndex);
        }

        mk.$id(type + '-cost').textContent = mk.numberFormat(totalCost);

        if (type === 'spells') {
            setQuantityAndSpace(params.space, totalSpace, type);
            if (totalTime > 0) {
                mk.$id(type + '-time').textContent = mk.getFormattedTime(totalTime, true);
            }
        } else {
            var barracksQueue = mk.calc.allBarracks[type].getQueue();
            var boostedCount = barracksQueue.filter(function(barrack) {
                return barrack.isBoosted() === true;
            }).length;

            if (boostedCount) {
                maxUnitTime = Math.ceil(maxUnitTime / 4);
            }

            var virtualBarracksCount = mk.calc.allBarracks[type].getActiveCount() + (boostedCount * 4);
            var avgTime = Math.max(Math.ceil(totalTime / virtualBarracksCount), maxUnitTime);

            var fillSuccess = mk.calc.fillBarracks(barracksQueue, distribution, avgTime);

            currentSpace[type] += totalSpace;

            var fn;
            if (params.computeAll || !window.mkIsMobile) {
                fn = populateDistribution;
            } else {
                fn = populateDistributionDebounced;
            }
            fn(fillSuccess, type, barracksQueue);

            var subtractedCostEl = mk.$id(type + '-subtracted-cost');
            if (subtractedCost === totalCost) {
                subtractedCostEl.textContent = '';
            } else {
                subtractedCostEl.innerHTML = '− ' + mk.numberFormat(totalCost - subtractedCost) +
                                             ' = <span class="result">' + mk.numberFormat(subtractedCost) + '</span>';
            }
        }
    };

    var darkObjects = mk.$('.js-dark-object');
    var spellsObjects = mk.$('.js-spells-object');
    var calculate = function(params) {
        if (params.type === 'all' || params.type !== 'spells') {

            if (params.type === 'all' || params.type === 'barrack-units') {
                updateBarracksHeaders('units');
            }

            if (params.type === 'all' || params.type === 'barrack-dark') {
                updateBarracksHeaders('dark');

                var method = 'remove';
                if (mk.calc.allBarracks.dark.getMaxLevel() === 0) {
                    method = 'add';
                }
                darkObjects.iterate(function(el) {
                    el.classList[method]('setting-mode-empty');
                });
            }

            var armyCampsSpace = parseInt(mk.calc.armyCamps.value, 10);

            if (params.type === 'all' || params.type === 'units' || params.type === 'barrack-units') {
                currentSpace.units = 0;
                calculateItems('units', {
                    'levelValue': mk.calc.allBarracks.units.getMaxLevel(),
                    'capLevel': mk.calc.allBarracks.units.getCapLevel(),
                    'computeAll': params.computeAll
                });
            }

            if (params.type === 'all' || params.type === 'dark' || params.type === 'barrack-dark') {
                currentSpace.dark = 0;
                calculateItems('dark', {
                    'levelValue': mk.calc.allBarracks.dark.getMaxLevel(),
                    'capLevel': mk.calc.allBarracks.dark.getCapLevel(),
                    'computeAll': params.computeAll
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
                'computeAll': params.computeAll
            });

            mk.calc.savedData.set('spellFactoryLevel', mk.calc.spellFactoryLevel.selectedIndex);

            var method = 'remove';
            if (spellFactoryLevel === 0) {
                method = 'add';
            }
            spellsObjects.iterate(function(el) {
                el.classList[method]('setting-mode-empty');
            });
        }

        mk.calc.savedDataAll.update(0, mk.calc.savedData);
        mk.calc.savedDataStorage.save(mk.calc.savedDataAll.getAll());

        mk.Events.trigger('calculated');
    };

    mk.Events.listen('calculate', calculate);

}());