part([
    'savedData',
    'types',
    'events',
    'dom',
    'barracks',
    'common',
    'calculate'
], function(savedData, types, events, dom, barracks, common, calculate) {

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

    var populateDistribution = function(result, type) {

        var times = [];
        if (result[type].fillSuccess) {
            dom.id(type + '-barracks-exceeded').style.display = 'none';
            var maxTime = 0;
            var maxNum = 1;

            while (result[type].barracksQueue.length) {
                var barrack = result[type].barracksQueue.shift();

                for (var unitIndex in barrack.units) {
                    if (barrack.units[unitIndex] > 0) {
                        dom.id(
                            'quantity-' +
                            result[type].typesSortedLevel[unitIndex][5] +
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
            while (result[type].barracksQueue.length) {
                var barrack = result[type].barracksQueue.shift();
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
                        space += result[type].totalSpace - sumSpace;
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

        if (result.params.type === 'all' || result.params.type === 'spells') {
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
                        var mcLength = barracks[type].data.count;
                        while (++mcIndex <= mcLength) {
                            dom.id('quantity-' + objectResult.name + '-' + mcIndex).textContent = '';
                        }
                    }
                });

                dom.id(type + '-cost').textContent = common.numberFormat(result[type].totalCost);
            }
        });

        if (result.params.type === 'all' || result.params.type !== 'spells') {
            ['units', 'dark'].forEach(function(type) {
                if (result[type]) {
                    var fn;
                    if (result.params.computeAll || !window.mkIsMobile) {
                        fn = populateDistribution;
                    } else {
                        fn = populateDistributionDebounced;
                    }
                    fn(result, type);

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
        }
    });

    events.listen('calculate', function(params) {
        params.savedData = savedData.current;
        params.current = true;

        events.trigger('calculateDone', calculate(params));

        savedData.save();
    });

});