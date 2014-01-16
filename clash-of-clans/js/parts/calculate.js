part('calculate', [
    'spellFactory',
    'savedData',
    'types',
    'events',
    'dom',
    'barracks',
    'common'
], function(spellFactory, savedData, types, events, dom, barracksInfo, common) {

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

    var typesSortedLevel = {};
    Object.keys(types.data).forEach(function(type) {
        typesSortedLevel[type] = [];
        Object.keys(types.data[type]).forEach(function(name) {
            typesSortedLevel[type].unshift(types.data[type][name].concat(name));
        });
    });

    var setQuantityAndSpace = function(maxSpace, totalSpace, type) {
        var spaceDiff = maxSpace - totalSpace;
        if (spaceDiff < 0) {
            spaceDiff = '<span class="limit-exceeded">' + spaceDiff + '</span>';
        }
        dom.id(type + '-quantity').innerHTML = '(' + spaceDiff + ' free)';

        var space = totalSpace;
        if (totalSpace > maxSpace) {
            space = '<span class="limit-exceeded">' + totalSpace + '</span>';
        }
        space = space + ' / ' + (type === 'units' ? '': maxSpace);
        dom.id(type + '-space').innerHTML = space;

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

    var fillBarracks = function(barracksQueue, unitsDistribution, avgTime, activeCount) {
        var isSuitedForEqual = true;

        var maxUnitLevel = 0;
        var totalUnitsSpace = 0;
        unitsDistribution.forEach(function(kit) {
            if (isSuitedForEqual && kit[1] % activeCount !== 0) {
                isSuitedForEqual = false;
            }

            maxUnitLevel = Math.max(kit[2], maxUnitLevel);
            totalUnitsSpace += kit[1] * kit[4];
        });

        var isAllBarracksSimilar = true;
        var totalBarracksSpace = 0;
        var barracksNums = [];
        barracksQueue.forEach(function(barrack) {
            if (barrack.level !== 0) {
                var boostedLikeFirst = (barrack.isBoosted === barracksQueue[0].isBoosted);
                if (isSuitedForEqual && !(barrack.level >= maxUnitLevel && boostedLikeFirst)) {
                    isSuitedForEqual = false;
                }

                if (isAllBarracksSimilar && !(barrack.level === barracksQueue[0].level && boostedLikeFirst)) {
                    isAllBarracksSimilar = false;
                }

                barracksNums.push(barrack.num);

                totalBarracksSpace += barrack.maxSpace;
            }
        });

        isSuitedForEqual = (isSuitedForEqual && totalBarracksSpace >= totalUnitsSpace);

        var stopDistribution = false;

        while (unitsDistribution.length) {
            var kit = unitsDistribution.shift();
            var kitIndex = kit[0];
            var kitQuantity = kit[1];
            var kitLevel = kit[2];
            var kitTime = kit[3];
            var kitSpace = kit[4];

            if (isSuitedForEqual) {
                var quantityPerBarrack = kitQuantity / activeCount;
                var timePerBarrack = quantityPerBarrack * kitTime;
                var spacePerBarrack = quantityPerBarrack * kitSpace;

                barracksQueue.forEach(function(barrack) {
                    if (barrack.level !== 0) {
                        barrack.units[kitIndex] = quantityPerBarrack;
                        barrack.time += timePerBarrack;
                        barrack.space += spacePerBarrack;
                    }
                });
            } else {
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
        }

        if (!stopDistribution && isAllBarracksSimilar && !isSuitedForEqual) {
            barracksQueue.sort(function(a, b) {
                return b.getActualTime() - a.getActualTime();
            });
            barracksQueue.forEach(function(barrack, index) {
                if (barrack.level !== 0) {
                    barrack.num = barracksNums[index];
                }
            });
        }

        return !stopDistribution;
    };

    var populateDistribution = function(fillSuccess, type, barracksQueue) {
        var times = [];
        if (fillSuccess) {
            dom.id(type + '-barracks-exceeded').style.display = 'none';
            var maxTime = 0;
            var maxNum = 1;

            while (barracksQueue.length) {
                var barrack = barracksQueue.shift();

                for (var unitIndex in barrack.units) {
                    if (barrack.units[unitIndex] > 0) {
                        dom.id(
                            'quantity-' +
                            typesSortedLevel[type][unitIndex][5] +
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

                var time = (actualTime ? common.getFormattedTime(actualTime) : '');
                if (barrack.isBoosted) {
                    time = '<span class="boosted">' + time + '</span>';
                }
                times[barrack.num] = time;

                var spaceData = '';
                if (barrack.maxSpace !== 0) {
                    spaceData = barrack.space + ' / ';
                }
                dom.id(type + '-barrack-space-' + barrack.num).textContent = spaceData;
            }
            times.forEach(function(time, num) {
                var barrackEl = dom.id(type + '-time-barrack-' + num);
                if (num === maxNum) {
                    time = '<span class="result">' + time + '</span>';
                }
                barrackEl.innerHTML = time;
            });
        } else {
            dom.id(type + '-barracks-exceeded').style.display = '';
            var spaces = [];
            var sumSpace = 0;
            while (barracksQueue.length) {
                var barrack = barracksQueue.shift();
                dom.id(type + '-time-barrack-' + barrack.num).textContent = '';

                spaces[barrack.num] = barrack.space;
                sumSpace += barrack.space;
            }

            var firstIteration = true;
            spaces.forEach(function(space, num) {
                var barrackSpaceEl = dom.id(type + '-barrack-space-' + num);
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
        var typeResult = {
            'capLevel': params.capLevel,
            'levelValue': params.levelValue,
            'objects': []
        };

        var totalCost = 0;
        var subtractedCost = 0;
        var totalSpace = 0;
        var totalTime = 0;
        var maxUnitTime = 0;
        var distribution = [];

        var tsIndex = -1; // ts - types sorted
        var tsLength = typesSortedLevel[type].length;
        while (++tsIndex < tsLength) {
            var objectResult = {};

            var value = typesSortedLevel[type][tsIndex];
            if (value[3] > params.levelValue) {
                continue;
            }

            var name = value[5];

            var quantity = params.savedData.get(name);
            var costPerItem = value[1][params.savedData.get(name + '-level')];
            var summaryCost = (costPerItem * quantity);

            objectResult.name = name;
            objectResult.summaryCost = summaryCost;

            totalCost += summaryCost;

            totalSpace += (value[2] * quantity);
            if (type === 'spells') {
                totalTime += (value[0] * quantity);
            } else {
                var subtractQuantity = 0;
                if (params.current) {
                    subtractQuantity = parseInt(dom.id(name + '-subtract').value, 10) || 0;
                }

                if (subtractQuantity) {
                    events.trigger('goal', {
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

            typeResult.objects.push(objectResult);
        }

        typeResult.totalCost = totalCost;
        typeResult.totalSpace = totalSpace;

        if (type === 'spells') {
            typeResult.totalTime = totalTime;
        } else {
            var barracksQueue = barracksInfo[type].getQueue(params.savedData, params.current);
            var boostedCount = barracksQueue.filter(function(barrack) {
                return barrack.isBoosted === true;
            }).length;

            if (boostedCount) {
                maxUnitTime = Math.ceil(maxUnitTime / 4);
            }

            var activeCount = barracksQueue.filter(function(barrack) {
                return barrack.level > 0;
            }).length;
            var virtualBarracksCount = activeCount + (boostedCount * 4);
            var avgTime = Math.max(Math.ceil(totalTime / virtualBarracksCount), maxUnitTime);

            typeResult.fillSuccess = fillBarracks(barracksQueue, distribution, avgTime, activeCount);
            typeResult.barracksQueue = barracksQueue;
            typeResult.subtractedCost = subtractedCost;
        }

        return typeResult;
    };

    var calculate = function(params) {
        var result = {
            'params': params
        };

        if (params.type === 'all' || params.type !== 'spells') {
            result.units = calculateItems('units', {
                'levelValue': barracksInfo.units.getMaxLevel(params.savedData),
                'capLevel': barracksInfo.units.data.maxLevel,
                'savedData': params.savedData,
                'current': params.current
            });

            result.dark = calculateItems('dark', {
                'levelValue': barracksInfo.dark.getMaxLevel(params.savedData),
                'capLevel': barracksInfo.dark.data.maxLevel,
                'savedData': params.savedData,
                'current': params.current
            });

            result.armyCampsSpace = params.savedData.get('armyCamps');
        }

        if (params.type === 'all' || params.type === 'spells') {
            result.spells = calculateItems('spells', {
                'levelValue': params.savedData.get('spellFactoryLevel'),
                'capLevel': spellFactory.max,
                'savedData': params.savedData
            });
        }

        return result;
    };

    var populateDistributionDebounced = debounce(populateDistribution, 200);

    var darkObjects = dom.find('.js-dark-object');
    var spellsObjects = dom.find('.js-spells-object');
    events.listen('calculateDone', function(result) {
        if (result.params.type === 'all' || result.params.type === 'barrack-dark') {
            darkObjects.toggleClass('setting-mode-empty', (result.dark.levelValue === 0));
        }

        if (result.params.type === 'all' || result.params.type !== 'spells') {
            var togetherSpace = result.units.totalSpace + result.dark.totalSpace;
            setQuantityAndSpace(result.armyCampsSpace, togetherSpace, 'units');
            setQuantityAndSpace(result.armyCampsSpace, togetherSpace, 'dark');
        }

        if (result.spells) {
            setQuantityAndSpace(result.spells.levelValue, result.spells.totalSpace, 'spells');

            if (result.spells.totalTime > 0) {
                if (localStorage.getItem('spell-factory-boosted') === 'yes') {
                    dom.id('spells-time').innerHTML = '<span class="boosted">' +
                                                      common.getFormattedTime(
                                                          Math.floor(result.spells.totalTime / 4),
                                                          true
                                                      ) +
                                                      '</span>';
                } else{
                    dom.id('spells-time').textContent = common.getFormattedTime(result.spells.totalTime, true);
                }
            }

            spellsObjects.toggleClass('setting-mode-empty', (result.spells.levelValue === 0));
        }

        ['units', 'dark', 'spells'].forEach(function(type) {
            if (result[type]) {
                var clIndex = result[type].capLevel + 1;
                while (--clIndex > 0) {
                    dom.id(
                        type +
                        '-building-level-' +
                        clIndex
                    ).style.display = (clIndex > result[type].levelValue ? 'none' : '');
                }

                result[type].objects.forEach(function(objectResult) {
                    dom.id(objectResult.name + '-summary').textContent = (
                        objectResult.summaryCost ?
                        common.numberFormat(objectResult.summaryCost) :
                        ''
                    );

                    if (type !== 'spells') {
                        var mcIndex = 0; // mc - max count
                        var mcLength = barracksInfo[type].data.count;
                        while (++mcIndex <= mcLength) {
                            dom.id('quantity-' + objectResult.name + '-' + mcIndex).textContent = '';
                        }
                    }
                });

                dom.id(type + '-cost').textContent = common.numberFormat(result[type].totalCost);
            }
        });

        ['units', 'dark'].forEach(function(type) {
            if (result[type]) {
                var fn;
                if (result.params.computeAll || !window.mkIsMobile) {
                    fn = populateDistribution;
                } else {
                    fn = populateDistributionDebounced;
                }
                fn(result[type].fillSuccess, type, result[type].barracksQueue);

                var subtractedCostEl = dom.id(type + '-subtracted-cost');
                if (result[type].subtractedCost === result[type].totalCost) {
                    subtractedCostEl.textContent = '';
                } else {
                    subtractedCostEl.innerHTML = '− ' +
                                                 common.numberFormat(result[type].totalCost - result[type].subtractedCost) +
                                                 ' = <span class="result">' +
                                                 common.numberFormat(result[type].subtractedCost) + '</span>';
                }
            }
        });
    });

    events.listen('calculate', function(params) {
        params.savedData = savedData.current;
        params.current = true;

        events.trigger('calculateDone', calculate(params));

        savedData.all.update(0, savedData.current);
        savedData.save();

        events.trigger('calculated');
    });

    return {
        'typesSortedLevel': typesSortedLevel,
        'fillBarracks': fillBarracks
    };
});