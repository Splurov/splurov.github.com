part([
    'savedData',
    'events',
    'dom',
    'barracks',
    'common',
    'calculate'
], function(savedData, events, dom, barracks, common, calculate) {

    'use strict';

    var setQuantityAndSpace = function(maxSpace, totalSpace, type) {
        var spaceDiff = maxSpace - totalSpace;
        if (spaceDiff < 0) {
            spaceDiff = '<span class="limit-exceeded">' + spaceDiff + '</span>';
        }
        dom.updater.defer(type + '-quantity', 'html', '(' + spaceDiff + ' free)');

        var space = totalSpace;
        if (totalSpace > maxSpace) {
            space = '<span class="limit-exceeded">' + totalSpace + '</span>';
        }
        space = space + '&thinsp;/&thinsp;' + (type === 'light' ? '': maxSpace);
        dom.updater.defer(type + '-space', 'html', space);

    };

    var populateDistribution = function(distributionResult, type) {
        var times = [];
        if (distributionResult.fillSuccess) {
            dom.updater.defer(type + '-exceeded', 'display', 'none');
            var maxTime = 0;
            var maxNum = 1;

            while (distributionResult.barracksQueue.length) {
                var barrack = distributionResult.barracksQueue.shift();

                for (var unitIndex in barrack.units) {
                    if (barrack.units[unitIndex]) {
                        dom.updater.defer('quantity-' + distributionResult.typesSortedLevel[unitIndex][5] + '-' +
                                          barrack.num, 'text', '×' + barrack.units[unitIndex]);
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
                dom.updater.defer(type + '-space-' + barrack.num, 'text', spaceData);
            }
            times.forEach(function(time, num) {
                if (num === maxNum) {
                    time = '<span class="result">' + time + '</span>';
                }
                dom.updater.defer(type + '-time-' + num, 'html', time);
            });
        } else {
            dom.updater.defer(type + '-exceeded', 'display', '');
            var spaces = [];
            var sumSpace = 0;
            while (distributionResult.barracksQueue.length) {
                var barrack = distributionResult.barracksQueue.shift();
                dom.updater.defer(type + '-time-' + barrack.num, 'text', '');

                spaces[barrack.num] = barrack.space;
                sumSpace += barrack.space;
            }

            var firstIteration = true;
            spaces.forEach(function(space, num) {
                var barrackSpaceId = type + '-space-' + num;
                if (space === 0) {
                    dom.updater.defer(barrackSpaceId, 'text', '');
                } else {
                    if (firstIteration) {
                        space += distributionResult.totalSpace - sumSpace;
                        dom.updater.defer(barrackSpaceId, 'html',
                                          '<span class="limit-exceeded result">' + space + '</span> / ');

                        firstIteration = false;
                    } else {
                        dom.updater.defer(barrackSpaceId, 'text', space + ' / ');
                    }
                }
            });
        }
    };

    var darkObjects = dom.find('.js-dark-object');
    var spellsObjects = dom.find('.js-spells-object');
    events.watch('calculateDone', function(result) {
        /*
        Types:
            all
            barrack-dark
            barrack-light
            units
            dark
            spells
         */

        if (result.params.type === 'all' || result.params.type === 'barrack-dark') {
            darkObjects.toggleClass('setting-mode-empty', (result.dark.levelValue === 0));
        }

        if (result.params.type === 'all' || result.params.type !== 'spells') {
            var togetherSpace = result.light.totalSpace + result.dark.totalSpace;
            setQuantityAndSpace(result.armyCampsSpace, togetherSpace, 'light');
            setQuantityAndSpace(result.armyCampsSpace, togetherSpace, 'dark');
        }

        if (result.params.type === 'all' || result.params.type === 'spells') {
            setQuantityAndSpace(result.spells.levelValue, result.spells.totalSpace, 'spells');

            if (result.spells.totalTime) {
                var spellsTimeId = 'spells-time';
                var spellsTimeValue;
                if (localStorage.getItem('spells-boosted') === 'yes') {
                    spellsTimeValue = '<span class="boosted">' +
                                      common.getFormattedTime(Math.floor(result.spells.totalTime / 4), true) +
                                      '</span>';
                } else {
                    spellsTimeValue = common.getFormattedTime(result.spells.totalTime, true);
                }
                dom.updater.defer(spellsTimeId, 'html', spellsTimeValue);
            }

            spellsObjects.toggleClass('setting-mode-empty', (result.spells.levelValue === 0));
        }

        ['light', 'dark', 'spells'].forEach(function(type) {
            if (['all', 'barrack-' + type, type].indexOf(result.params.type) !== -1) {
                var clIndex = result[type].capLevel + 1;
                while (--clIndex > 0) {
                    dom.updater.defer(type + '-building-level-' + clIndex, 'display',
                                     (clIndex > result[type].levelValue ? 'none' : ''));
                }

                result[type].objects.forEach(function(objectResult) {
                    dom.updater.defer(objectResult.name + '-summary', 'text',
                                      objectResult.summaryCost ? common.numberFormat(objectResult.summaryCost) : '');

                    if (type !== 'spells') {
                        var mcIndex = 0; // mc - max count
                        var mcLength = barracks[type].data.count;
                        while (++mcIndex <= mcLength) {
                            dom.updater.defer('quantity-' + objectResult.name + '-' + mcIndex, 'text', '');
                        }
                    }
                });

                dom.updater.defer(type + '-cost', 'text', common.numberFormat(result[type].totalCost));

                if (type !== 'spells') {
                    populateDistribution(result[type], type);

                    var subtractedCostId = type + '-subtracted-cost';
                    if (result[type].subtractedCost === result[type].totalCost) {
                        dom.updater.defer(subtractedCostId, 'text', '');
                    } else {
                        dom.updater.defer(subtractedCostId, 'html',
                                          '−&thinsp;' +
                                          common.numberFormat(result[type].totalCost - result[type].subtractedCost) +
                                          '&thinsp;=&thinsp;<span class="result">' +
                                          common.numberFormat(result[type].subtractedCost) + '</span>');
                    }
                }
            }
        });

        dom.updater.runDeferred();
    });

    events.watch('calculate', function(params) {
        params.savedData = savedData.current;
        params.current = true;

        events.trigger('calculateDone', calculate(params));

        savedData.save();
    });

});