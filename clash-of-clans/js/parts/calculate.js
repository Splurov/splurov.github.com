part('calculate', [
    'storage',
    'types',
    'dom',
    'goal',
    'common'
], function(storage, types, dom, goal, common) {

    'use strict';

    var typesSorted = {};
    Object.keys(types.data).forEach(function(type) {
        typesSorted[type] = [];
        Object.keys(types.data[type]).forEach(function(name) {
            typesSorted[type].unshift(types.data[type][name].concat(name));
        });
    });
    typesSorted.dark.sort(function(a, b) {
        return b[2] - a[2];
    });

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

    var getSuitableBarrack = function(barracksQueue,
                                      requiredLevel,
                                      requiredSpace,
                                      requiredTime,
                                      avgTime) {
        var suitable = barracksQueue.filter(function(barrack) {
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

                if (isSuitedForEqual && (totalUnitsSpace / activeCount) > barrack.maxSpace) {
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

    var calculateItems = function(type, params) {
        var levelValue;
        if (type === 'spells') {
            levelValue = params.storage.get('spells-level', 0);
        } else {
            var levels = [];
            var i = 0;
            while (++i <= types.buildings[type].count) {
                levels.push(params.storage.get(type + '-level-' + i, 0));
            }
            levelValue = Math.max.apply(null, levels);
        }

        var typeResult = {
            'capLevel': params.capLevel,
            'levelValue': levelValue,
            'objects': []
        };

        var totalCost = 0;
        var subtractedCost = 0;
        var totalSpace = 0;
        var totalTime = 0;
        var maxUnitTime = 0;
        var distribution = [];

        var stones = [];

        var tsIndex = -1; // ts - types sorted
        var tsLength = typesSorted[type].length;
        while (++tsIndex < tsLength) {
            var objectResult = {};

            var value = typesSorted[type][tsIndex];
            if (value[3] > levelValue) {
                continue;
            }

            var name = value[5];

            var quantity = params.storage.get(name, 0);
            var level = params.storage.get(name + '-level', 0);
            var costPerItem = value[1][level];
            var summaryCost = (costPerItem * quantity);

            objectResult.name = name;
            objectResult.summaryCost = summaryCost;
            objectResult.level = level;
            objectResult.minBarrackLevel = value[3];

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
                    goal.reach('SUBTRACT');
                }

                quantity -= subtractQuantity;
                if (quantity < 0) {
                    quantity = 0;
                }
                if (quantity) {
                    distribution.push([
                        tsIndex,
                        quantity,
                        value[3], // level
                        value[0], // time
                        value[2] // space
                    ]);
                    maxUnitTime = Math.max(maxUnitTime, value[0]);
                    totalTime += (value[0] * quantity);

                    stones.push({
                        'index': tsIndex,
                        'name': name,
                        'barrackLevel': value[3],
                        'time': value[0],
                        'space': value[2],
                        'quantity': quantity
                    });
                }

                subtractedCost += (costPerItem * quantity);

            }
            objectResult.quantity = quantity;

            typeResult.objects.push(objectResult);
        }
        typeResult.typesSorted = typesSorted[type];

        typeResult.totalCost = totalCost;
        typeResult.totalSpace = totalSpace;

        if (type === 'spells') {
            typeResult.totalTime = totalTime;
        } else {
            var barracksQueue = levels.map(function(level, index) {
                var num = index + 1;

                var isBoosted = false;
                if (params.current) {
                    isBoosted = localStorage.getItem(type + '-boosted-' + num) === 'yes';
                }

                return {
                    'num': num,
                    'time': 0,
                    'space': 0,
                    'maxSpace': types.buildings[type].queue[level],
                    'units': {},
                    'level': level,
                    'isBoosted': isBoosted,
                    'getActualTime': function() {
                        if (this.isBoosted) {
                            return Math.floor(this.time / 4);
                        }

                        return this.time;
                    }
                };
            });

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

            if (params.current) {
                console.time('old distribution');
            }
            typeResult.fillSuccess = fillBarracks(barracksQueue, distribution, avgTime, activeCount);
            if (params.current) {
                console.timeEnd('old distribution');
            }
            typeResult.barracksQueue = barracksQueue;
            typeResult.subtractedCost = subtractedCost;


            var boxes = levels.map(function(level, index) {
                return {
                    'num': index + 1,
                    'time': 0,
                    'space': 0,
                    'maxSpace': types.buildings[type].queue[level],
                    'stones': {},
                    'level': level
                };
            });

            if (params.current) {
                console.time('NEW DISTRIBUTION');
                typeResult.distribution = fillBoxes(boxes, stones, type);
                console.timeEnd('NEW DISTRIBUTION');
            }
        }

        return typeResult;
    };

    function fillBoxes(boxes, stones, type) {
        var i, j, l, m;

        var activeBoxes = boxes.filter(function(box) {
            return (box.level !== 0);
        });

        if (!stones.length || !activeBoxes.length) {
            return {
                'stones': stones,
                'boxes': boxes
            };
        }

        var params = {
            'type': type
        };

        var totalTime = stones.reduce(function(a, b) {
            return a + (b.time * b.quantity);
        }, 0);

        params.averageTime = Math.ceil(totalTime / activeBoxes.length);

        var averageTimeCorrection = params.averageTime % 5;
        if (averageTimeCorrection !== 0) {
            params.averageTime += (5 - averageTimeCorrection);
        }

        params.averageTime = stones.reduce(function(a, b) {
            return Math.max(a, b.time);
        }, params.averageTime);

        console.log(params.averageTime);

        if (type === 'light' && stones.length > 1) {
            var divideImportance = [7, 6, 5, 4, 10, 9, 8];
            var stonesForDivide = stones.filter(function(stone) {
                return divideImportance.indexOf(stone.barrackLevel) !== -1 && stone.quantity > 1;
            });

            console.log('STONES FOR DIVIDE:', stonesForDivide);

            if (stonesForDivide.length) {
                var maxParts = 11;
                var maxNewParts = maxParts - stones.length;
                var maxStonesForDivide = Math.min(maxNewParts, stonesForDivide.length);
                var divideNum = 1 + Math.floor(maxNewParts / maxStonesForDivide);

                console.log('DIVIDE NUM:', divideNum);

                stonesForDivide.sort(function(a, b) {
                    return divideImportance.indexOf(a.barrackLevel) - divideImportance.indexOf(b.barrackLevel);
                });

                for (i = 0, l = maxStonesForDivide; i < l; i++) {
                    var currentDivideNum = Math.min(stonesForDivide[i].quantity, divideNum);
                    var partQuantity = Math.floor(stonesForDivide[i].quantity / currentDivideNum);
                    for (j = 1, m = currentDivideNum; j < m; j++) {
                        var stonePart = common.objectCopy(stonesForDivide[i]);
                        stonesForDivide[i].quantity -= partQuantity;
                        stonePart.quantity = partQuantity;
                        stones.push(stonePart);
                    }
            }
            }

            console.log('STONES AFTER DIVIDE', common.objectCopy(stones));
        }

        // lowest first
        activeBoxes.sort(function(a, b) {
            return a.level - b.level;
        });

        var attempts = makeAttempts(activeBoxes, stones, params);

        attempts.sort(function(a, b) {
            if (a.stones.length === b.stones.length) {
                return a.time - b.time;
            }
            return a.stones.length - b.stones.length;
        });

        activeBoxes = attempts[0].boxes;

        for (i = 0, l = activeBoxes.length; i < l; i++) {
            for (j = 0, m = boxes.length; j < m; j++) {
                if (activeBoxes[i].num === boxes[j].num) {
                    boxes[j] = activeBoxes[i];
                }
            }
        }

        return {
            'remaining': attempts[0].stones.length,
            'boxes': boxes
        };
    }

    function makeAttempts(activeBoxes, stones, params) {
        var i, j, k, l, m, n;

        var attempts = [];

        var variants0 = findOptimal(activeBoxes[0], stones, params, 5);

        for (j = 0, m = variants0.length; j < m; j++) {
            var attemptBoxes1 = common.objectCopy(activeBoxes);
            var attemptStones1 = common.objectCopy(stones);

            processVariant(attemptBoxes1[0], variants0[j], attemptStones1, params);

            k = 1;
            if (activeBoxes[k]) {
                var variants1 = findOptimal(attemptBoxes1[k], attemptStones1, params, 5);

                for (var s = 0, t = variants1.length; s < t; s++) {
                    var attemptBoxes2 = common.objectCopy(attemptBoxes1);
                    var attemptStones2 = common.objectCopy(attemptStones1);

                    processVariant(attemptBoxes2[k], variants1[s], attemptStones2, params);

                    for (var x = k + 1, y = attemptBoxes2.length; x < y; x++) {
                        var variants2 = findOptimal(attemptBoxes2[x], attemptStones2, params, 1);

                        if (variants2.length) {
                            processVariant(attemptBoxes2[x], variants2[0], attemptStones2, params);
                        }
                    }

                    if (saveAttempt(attempts, attemptBoxes2, attemptStones2, params)) {
                        return attempts;
                    }
                }
            }

            if (!activeBoxes[1]) {
                if (saveAttempt(attempts, attemptBoxes1, attemptStones1, params)) {
                    return attempts;
                }
            }
        }

        return attempts;
    }

    function saveAttempt(attempts, boxes, stones, params) {
        fillRemaining(boxes, stones);

        var maxTime = boxes.reduce(function(maxTime, box) {
            return Math.max(maxTime, box.time);
        }, 0);

        attempts.push({'boxes': boxes, 'stones': stones, 'time': maxTime});

        return (maxTime === params.averageTime && !stones.length);
    }

    function fillRemaining(boxes, stones) {
        var i, j, k, l, m, n;

        // max time first
        stones.sort(function(a, b) {
            return b.time - a.time;
        });
        for (i = 0; i < stones.length; i++) {
            var stone = stones[i];

            for (j = 0, m = stone.quantity; j < m; j++) {
                // min time first
                boxes.sort(function(a, b) {
                    return a.time - b.time;
                });

                for (k = 0, n = boxes.length; k < n; k++) {
                    var box = boxes[k];

                    var isMatchLevel = (stone.barrackLevel <= box.level);
                    var isMatchSpace = ((box.space + stone.space) <= box.maxSpace);

                    if (isMatchLevel && isMatchSpace) {
                        box.space += stone.space;
                        box.time += stone.time;
                        if (!box.stones[stone.name]) {
                            box.stones[stone.name] = 0;
                        }
                        box.stones[stone.name]++;

                        stone.quantity--;
                        if (stone.quantity === 0) {
                            stones.splice(i, 1);
                            i--;
                        }
                        break;
                    }
                }
            }
        }
    }

    function findOptimal(box, stones, params, returnCount) {
        var actual = stones.filter(function(stone) {
            return stone.barrackLevel <= box.level;
        });

        var variants = [];

        if (!actual.length) {
            return variants;
        }

        var SMALL_LCM = 5;

        var hashes = [];

        var hashExists = function(boxStones) {
            var hash = '';

            for (var m = 0; m < boxStones.length; m++) {
                if (boxStones[m]) {
                    hash += m + '.' + boxStones[m] + '-';
                }
            }

            if (hashes.indexOf(hash) !== -1) {
                return true;
            }

            hashes.push(hash);

            return false;
        };

        var generateSmall = function(fastBox, stoneA, stoneB, remainingTime) {
            var remainingSpace = (box.maxSpace - fastBox[0]);

            for (var y = 1; y <= stoneB.quantity; y++) {
                var x = (remainingTime - (stoneB.time * y)) / stoneA.time;
                var sumSpace = x + y;
                if (x % 1 === 0 && x >= 0 && x <= stoneA.quantity && sumSpace <= remainingSpace) {
                    var currentFastBox = common.objectCopy(fastBox);
                    currentFastBox[0] += sumSpace;
                    currentFastBox[1] += (x * stoneA.time) + (y * stoneB.time);
                    currentFastBox[2][stoneA.index] = x;
                    currentFastBox[2][stoneB.index] = y;

                    if (hashExists(currentFastBox[2])) {
                        continue;
                    }

                    variants.push(currentFastBox);
                }
            }
        };

        var all = combine(actual, (actual.length === 1 ? 1 : 2));

        allCombinations:
        for (var i = 0; i < all.length; i++) {
            // space, time, stones
            var fastBox = [0, 0, []];

            // it's important, max space and max time first
            all[i].sort(function(a, b) {
                if (b.space === a.space) {
                    return b.time - a.time;
                }
                return b.space - a.space;
            });

            currentCombination:
            for (var j = 0; j < all[i].length; j++) {
                var stone = all[i][j];
                var remainingTime = (params.averageTime - fastBox[1]);
                if (stone.space === 1 && all[i][j + 1] && !all[i][j + 2] && (remainingTime % SMALL_LCM) === 0) {
                    generateSmall(fastBox, all[i][j], all[i][j + 1], remainingTime);
                    continue allCombinations;
                } else {
                    for (var k = 0; k < stone.quantity; k++) {
                        var isMatchSpace = ((fastBox[0] + stone.space) <= box.maxSpace);
                        var isMatchTime = ((fastBox[1] + stone.time) <= params.averageTime);

                        if (isMatchSpace && isMatchTime) {
                            fastBox[0] += stone.space;
                            fastBox[1] += stone.time;
                            if (!fastBox[2][stone.index]) {
                                fastBox[2][stone.index] = 1;
                            } else {
                                fastBox[2][stone.index]++;
                            }
                        }

                        if (fastBox[0] === box.maxSpace || fastBox[1] === params.averageTime) {
                            break currentCombination;
                        }
                    }
                }
            }

            if (hashExists(fastBox[2])) {
                continue;
            }

            variants.push(fastBox);
        }

        // max time and max space first
        variants.sort(function(a, b) {
            if (a[1] === b[1]) {
                return b[0] - a[0];
            }
            return b[1] - a[1];
        });

        return variants.filter(function(variant, index) {
            return index < returnCount || variant[1] === params.averageTime;
        });
    }

    function processVariant(box, variant, stones, params) {
        box.space = variant[0];
        box.time = variant[1];
        box.stones = {};
        for (var p = 0; p < variant[2].length; p++) {
            if (variant[2][p]) {
                box.stones[typesSorted[params.type][p][5]] = variant[2][p];
            }
        }

        var subtract = common.objectCopy(box.stones);

        for (var i = 0; i < stones.length; i++) {
            if (subtract[stones[i].name]) {
                var amount = Math.min(subtract[stones[i].name], stones[i].quantity);
                subtract[stones[i].name] -= amount;
                stones[i].quantity -= amount;
                if (stones[i].quantity === 0) {
                    stones.splice(i, 1);
                    i--;
                }
            }
        }
    }

    function combine(input, size){
        var results = [];
        var result;
        var mask;
        var total = Math.pow(2, input.length);

        for (mask = 0; mask < total; mask++) {
            result = [];
            var i = input.length - 1;
            do {
                if ((mask & (1 << i)) !== 0) {
                    result.push(input[i]);
                }
            } while(i--);
            if (result.length >= size) {
                results.push(result);
            }
        }

        return results;
    }

    return function calculate(params) {
        var result = {
            'params': params
        };

        result.armyCampsSpace = params.storage.get('army-camps', 0);

        ['light', 'dark', 'spells'].forEach(function(type) {
            var capLevel;
            if (type === 'spells') {
                capLevel = types.buildings.spells.max;
            } else {
                capLevel = types.buildings[type].maxLevel;
            }

            result[type] = calculateItems(type, {
                'storage': params.storage,
                'current': params.current,
                'capLevel': capLevel
            });
        });

        return result;
    };
});