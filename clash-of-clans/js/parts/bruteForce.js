part('bruteForce', [
    'common'
], function(common) {

    'use strict';

    function fillBoxes(boxes, stones, params) {
        var activeBoxes = boxes.filter(function(box) {
            return (box.level !== 0);
        });

        if (!stones.length || !activeBoxes.length) {
            return {
                'stones': stones,
                'boxes': boxes
            };
        }

        activeBoxes.forEach(function(box) {
            // calculate maximum time for each box based on stones
            // for low level boxes overall average time would be higher than calculated maximum time for box
            box.maxTime = calculateBoxMaxTime(box, stones);

            if (box.isBoosted) {
                box.maxTime *= params.boostedMultiplier;
            }

            box.averageTime = 0;
        });

        if (params.current) {
            console.log('MAX TIMES:', activeBoxes.map(function(a) {return a.maxTime;}))
        }

        // for each stone calculate number of boxes which can produce this stone
        // it is important to calculate average time for each box
        stones.forEach(function(stone) {
            stone.boxesCount = 0;
            activeBoxes.forEach(function(box) {
                if (stone.barrackLevel <= box.level) {
                    stone.boxesCount++;
                }
            });
        });

        stones.sort(function(a, b) {
            if (a.boxesCount === b.boxesCount) {
                return b.barrackLevel - a.barrackLevel;
            }

            return a.boxesCount - b.boxesCount;
        });

        var totalTime = stones.reduce(function(a, b) {
            return a + (b.time * b.quantity);
        }, 0);

        var averageTimeTemp = Math.ceil(totalTime / activeBoxes.length);
        console.log('average time temp:', averageTimeTemp);

        activeBoxes.sort(function(a, b) {
            return b.level - a.level;
        });


        stones.forEach(function(stone) {
            var stoneTotalTime = stone.time * stone.quantity;
            var stoneAverageTime = Math.ceil(stoneTotalTime / stone.boxesCount);
            var boxesCount = stone.boxesCount;
            activeBoxes.forEach(function(box) {
                if (stone.barrackLevel <= box.level) {
                    var newTime = box.averageTime + stoneAverageTime;
                    if (box.averageTime === 0 || (newTime <= averageTimeTemp && newTime <= box.maxTime)) {
                        box.averageTime += stoneAverageTime;
                        stoneTotalTime -= stoneAverageTime;
                    } else {
                        boxesCount--;
                        stoneAverageTime = Math.ceil((stone.time * stone.quantity) / boxesCount);
                    }
                }
            });

            if (stoneTotalTime > 0) {
                stoneAverageTime = Math.ceil(stoneTotalTime / stone.boxesCount);
                var remainingBoxes = activeBoxes.filter(function(box) {
                    return (box.maxTime >= (box.averageTime + stoneAverageTime)) && stone.barrackLevel <= box.level;
                });
                stoneAverageTime = Math.ceil(stoneTotalTime / remainingBoxes.length);
                remainingBoxes.forEach(function(box) {
                    box.averageTime += stoneAverageTime;
                });
            }
        });

        if (params.current) {
            console.log('BOXES AVERAGE TIME:', activeBoxes.map(function(a) {return a.num + ' : ' + a.averageTime;}));
        }

        /*
        activeBoxes.forEach(function(box) {
            box.averageTime = 0;

        });

        activeBoxes.forEach(function(box) {
            box.averageTime = 0;
            stones.forEach(function(stone) {
                if (stone.barrackLevel <= box.level) {
                    box.averageTime += ((stone.quantity * stone.time) / stone.boxesCount);
                }
            });
        });
        */

        if (params.current) {
            console.log('BOXES COUNT:', stones.map(function(a) {return a.boxesCount}));
            console.log('AVERAGE TIMES:', activeBoxes.map(function(a) {return a.averageTime}));
        }

        var boostedCount = activeBoxes.filter(function(box) {
            return box.isBoosted;
        }).length;

        var virtualBoxesCount = activeBoxes.length;
        if (boostedCount) {
            // each boosted box as <boostedMultiplier> regular boxes
            // minus one because one box already in active boxes
            virtualBoxesCount += (boostedCount * (params.boostedMultiplier - 1));
        }
        params.averageTime = Math.ceil(totalTime / virtualBoxesCount);
        if (params.current) {
            console.log('AVG TIME BEFORE:', params.averageTime);
        }

//        params.averageTime = stones.reduce(function(a, b) {
//            return Math.max(a, b.time);
//        }, params.averageTime);

        // min level first
        // it is important to correct average time from low level to high level
        // because each change of average time can affect previous checks
        // with sort this will not happen
        activeBoxes.sort(function(a, b) {
            return a.level - b.level;
        });

        activeBoxes.forEach(function(box) {
            if (box.maxTime < params.averageTime) {
                // increase average time in this case
                // distribute excess time for the other boxes
                params.averageTime += ((params.averageTime - box.maxTime) / (virtualBoxesCount - 1));
            }
        });

        var averageTimeCorrection = params.averageTime % 5;
        if (averageTimeCorrection !== 0) {
            params.averageTime += (5 - averageTimeCorrection);
        }

        if (params.current) {
            console.log('FINAL AVG TIME:', params.averageTime);
        }

        if (params.type === 'light' && stones.length > 1) {
            var divideImportance = [7, 6, 5, 4, 10, 9, 8];
            var stonesForDivide = stones.filter(function(stone) {
                return divideImportance.indexOf(stone.barrackLevel) !== -1 && stone.quantity > 1;
            });

            if (stonesForDivide.length) {
                var maxParts = 10;
                var minPartQuantity = 1;
                if (stonesForDivide.length === 1) {
                    minPartQuantity = 2;
                }
                var maxNewParts = maxParts - stones.length;
                var maxStonesForDivide = Math.min(maxNewParts, stonesForDivide.length);
                var divideNum = 1 + Math.floor(maxNewParts / maxStonesForDivide);

                stonesForDivide.sort(function(a, b) {
                    return divideImportance.indexOf(a.barrackLevel) - divideImportance.indexOf(b.barrackLevel);
                });

                for (var i = 0, l = maxStonesForDivide; i < l; i++) {
                    var currentDivideNum = Math.min(stonesForDivide[i].quantity, divideNum);
                    var partQuantity = Math.floor(stonesForDivide[i].quantity / currentDivideNum);
                    if (minPartQuantity > partQuantity && stonesForDivide[i].quantity > minPartQuantity) {
                        partQuantity = Math.max(partQuantity, minPartQuantity);
                        currentDivideNum = Math.floor(stonesForDivide[i].quantity / partQuantity);
                    }
                    for (var j = 1, m = currentDivideNum; j < m; j++) {
                        var stonePart = common.objectCopy(stonesForDivide[i]);
                        stonesForDivide[i].quantity -= partQuantity;
                        stonePart.quantity = partQuantity;
                        stones.push(stonePart);
                    }
                }
            }
        }

//        console.log(stones.length);

        activeBoxes.sort(function(a, b) {
            if (a.isBoosted === b.isBoosted) {
                if (boostedCount) {
                    return b.level - a.level;
                } else {
                    return a.level - b.level;
                }
            }

            return (a.isBoosted ? -1 : 1);
        });

        if (params.current) {
            console.time('attempts');
        }
        var attempts = makeAttempts(activeBoxes, stones, params);
        if (params.current) {
            console.timeEnd('attempts');
        }

        attempts.sort(function(a, b) {
            if (a.stones.length === b.stones.length) {
                return a.time - b.time;
            }
            return a.stones.length - b.stones.length;
        });

        attempts[0].boxes.forEach(function(activeBox) {
            boxes.forEach(function(box, boxIndex) {
                if (activeBox.num === box.num) {
                    boxes[boxIndex] = activeBox;
                }
            });
        });

        return {
            'remaining': attempts[0].stones.length,
            'boxes': boxes
        };
    }

    function calculateBoxMaxTime(box, stones) {
        var actualStones = getSuitableStones(box, stones);

        // max time to space ratio first
        actualStones.sort(function(a, b) {
            return (b.time / b.space) - (a.time/ a.space);
        });

        var boxSpace = 0;
        var boxTime = 0;
        actualStones.forEach(function(stone) {
            for (var i = 0, l = stone.quantity; i < l; i++) {
                if ((stone.space + boxSpace) > box.maxSpace) {
                    break;
                }

                boxSpace += stone.space;
                boxTime += stone.time;
            }
        });

        return boxTime;
    }

    function makeAttempts(activeBoxes, stones, params) {
        var attempts = [];

        var variants0 = findOptimal(activeBoxes[0], stones, params, 5);

        for (var i = 0, l = variants0.length; i < l; i++) {
            var attemptBoxes1 = common.objectCopy(activeBoxes);
            var attemptStones1 = common.objectCopy(stones);

            processVariant(attemptBoxes1[0], variants0[i], attemptStones1, params);

            if (activeBoxes[1]) {
                var variants1 = findOptimal(attemptBoxes1[1], attemptStones1, params, 5);

                for (var j = 0, m = variants1.length; j < m; j++) {
                    var attemptBoxes2 = common.objectCopy(attemptBoxes1);
                    var attemptStones2 = common.objectCopy(attemptStones1);

                    processVariant(attemptBoxes2[1], variants1[j], attemptStones2, params);

                    for (var k = 2, n = attemptBoxes2.length; k < n; k++) {
                        var variants2 = findOptimal(attemptBoxes2[k], attemptStones2, params, 1);

                        if (variants2.length) {
                            processVariant(attemptBoxes2[k], variants2[0], attemptStones2, params);
                        }
                    }

                    if (saveAttempt(attempts, attemptBoxes2, attemptStones2, params)) {
                        return attempts;
                    }
                }
            } else {
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
            return Math.max(maxTime, box.getActualTime());
        }, 0);

        attempts.push({'boxes': boxes, 'stones': stones, 'time': maxTime});

        return (maxTime === params.averageTime && !stones.length);
    }

    function fillRemaining(boxes, stones) {
        // max time first
        stones.sort(function(a, b) {
            return b.time - a.time;
        });
        for (var i = 0; i < stones.length; i++) {
            var stone = stones[i];

            for (var j = 0, m = stone.quantity; j < m; j++) {
                // min time first
                boxes.sort(function(a, b) {
                    return a.time - b.time;
                });

                for (var k = 0, n = boxes.length; k < n; k++) {
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
        var actual = getSuitableStones(box, stones);

        var variants = [];

        if (actual.length === 0) {
            return variants;
        }

        var SMALL_LCM = 5;
        var SMALL_MIN_QUANTITY = 20;

        var hashes = [];

        var hashExists = function(boxStones) {
            var hash = '';

            for (var m = 0; m < boxStones.length; m++) {
                if (boxStones[m] !== undefined) {
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

            var maxA = Math.min(stoneA.quantity, remainingSpace);
            var maxB = Math.min(stoneB.quantity, remainingSpace);

            remainingTime = Math.min(remainingTime, stoneA.time * remainingSpace);

            for (var y = 0; y <= maxB; y++) {
                var x = (remainingTime - (stoneB.time * y)) / stoneA.time;
                var sumSpace = x + y;
                if (x % 1 === 0 && x >= 0 && x <= maxA && sumSpace <= remainingSpace) {
                    var currentFastBox = common.objectCopy(fastBox);
                    currentFastBox[0] += sumSpace;
                    currentFastBox[1] += (x * stoneA.time) + (y * stoneB.time);
                    if (x !== 0) {
                        currentFastBox[2][stoneA.index] = x;
                    }
                    if (y !== 0) {
                        currentFastBox[2][stoneB.index] = y;
                    }

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
                var remainingTime = (box.getAverageTime(params.averageTime) - fastBox[1]);
                if (stone.quantity > SMALL_MIN_QUANTITY &&
                        stone.space === 1 &&
                        all[i][j + 1] &&
                        !all[i][j + 2] &&
                        (remainingTime % SMALL_LCM) === 0 &&
                        fastBox[0] !== 0) {
                    generateSmall(fastBox, stone, all[i][j + 1], remainingTime);
                    continue allCombinations;
                } else {
                    for (var k = 0; k < stone.quantity; k++) {
                        var isMatchSpace = ((fastBox[0] + stone.space) <= box.maxSpace);
                        var isMatchTime = ((fastBox[1] + stone.time) <= box.getAverageTime(params.averageTime));

                        if (isMatchSpace && isMatchTime) {
                            fastBox[0] += stone.space;
                            fastBox[1] += stone.time;
                            if (fastBox[2][stone.index] === undefined) {
                                fastBox[2][stone.index] = 1;
                            } else {
                                fastBox[2][stone.index]++;
                            }
                        }

                        if (fastBox[0] === box.maxSpace || fastBox[1] === box.getAverageTime(params.averageTime)) {
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
            return index < returnCount || variant[1] === box.getAverageTime(params.averageTime);
        });
    }

    function getSuitableStones(box, stones) {
        return stones.filter(function(stone) {
            return stone.barrackLevel <= box.level;
        });
    }

    function processVariant(box, variant, stones, params) {
        box.space = variant[0];
        box.time = variant[1];
        box.stones = {};
        for (var p = 0; p < variant[2].length; p++) {
            if (variant[2][p] !== undefined) {
                box.stones[params.typesSorted[params.type][p][5]] = variant[2][p];
            }
        }

        var subtract = common.objectCopy(box.stones);

        for (var i = 0; i < stones.length; i++) {
            if (subtract[stones[i].name] !== undefined) {
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

    return fillBoxes;

});