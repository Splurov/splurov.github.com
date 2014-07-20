part('calculateCurrent', [
    'storage',
    'dom',
    'types',
    'common',
    'calculate'
], function(storage, dom, types, common, calculate) {

    'use strict';

    var setQuantityAndSpace = function(maxSpace, totalSpace, type) {
        var spaceDiff = maxSpace - totalSpace;
        if (spaceDiff < 0) {
            spaceDiff = '<span class="limit-exceeded">' + spaceDiff.toString().replace('-', '&minus;') + '</span>';
        }
        dom.updater.defer(type + '-quantity', 'html', spaceDiff);

        var space = totalSpace;
        if (totalSpace > maxSpace) {
            space = '<span class="limit-exceeded">' + totalSpace + '</span>';
        }
        space = space + '&thinsp;/&thinsp;' + maxSpace;
        dom.updater.defer(type + '-space', 'html', space);

    };

    var populateDistribution = function(result, type) {
        var times = [];
        if (!result.distribution.remaining) {
            dom.updater.defer(type + '-exceeded', 'display', 'none');
            var maxTime = 0;
            var maxNum = 1;

            while (result.distribution.boxes.length) {
                var barrack = result.distribution.boxes.shift();

                for (var unitIndex in barrack.stones) {
                    dom.updater.defer('quantity-' + unitIndex + '-' +
                                      barrack.num, 'text', '×' + barrack.stones[unitIndex]);
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
            while (result.distribution.boxes.length) {
                var barrack = result.distribution.boxes.shift();
                dom.updater.defer(type + '-time-' + barrack.num, 'text', '');

                spaces[barrack.num] = barrack.space;
                sumSpace += barrack.space;
            }

            spaces.forEach(function(space, num) {
                var barrackSpaceId = type + '-space-' + num;
                if (space === 0) {
                    dom.updater.defer(barrackSpaceId, 'text', '');
                } else {
                    if (num === 1) {
                        space += result.totalSpace - sumSpace;
                        dom.updater.defer(barrackSpaceId, 'html',
                                          '<span class="limit-exceeded result">' + space + '</span> / ');

                    } else {
                        dom.updater.defer(barrackSpaceId, 'text', space + ' / ');
                    }
                }
            });
        }
    };

    var darkObjects = dom.find('.js-dark-object');
    var spellsObjects = dom.find('.js-spells-object');
    dom.listenCustom('calculateDone', function(result) {
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
            darkObjects.iterate(function(el) {
                el.style.display = (result.dark.levelValue === 0 ? 'none' : '');
            });
        }

        if (result.params.type === 'all' || result.params.type !== 'spells') {
            var togetherSpace = result.light.totalSpace + result.dark.totalSpace;
            setQuantityAndSpace(result.armyCampsSpace, togetherSpace, 'light');
            setQuantityAndSpace(result.armyCampsSpace, togetherSpace, 'dark');
        }

        if (result.params.type === 'all' || result.params.type === 'spells') {
            setQuantityAndSpace(result.spells.levelValue, result.spells.totalSpace, 'spells');

            var spellsTimeId = 'spells-time';
            var spellsTimeValue = '';
            if (result.spells.totalTime) {
                if (localStorage.getItem('spells-boosted') === 'yes') {
                    spellsTimeValue = '<span class="boosted">' +
                                      common.getFormattedTime(Math.floor(result.spells.totalTime / 4), true) +
                                      '</span>';
                } else {
                    spellsTimeValue = common.getFormattedTime(result.spells.totalTime, true);
                }

            }
            dom.updater.defer(spellsTimeId, 'html', spellsTimeValue);

            spellsObjects.iterate(function(el) {
                el.style.display = (result.spells.levelValue === 0 ? 'none' : '');
            });
        }

        ['light', 'dark', 'spells'].forEach(function(type) {
            if (['all', 'barrack-' + type, type].indexOf(result.params.type) !== -1) {
                var clIndex = result[type].capLevel + 1;
                while (--clIndex > 0) {
                    var rowId = type + '-building-level-' + clIndex;
                    var rowEl = dom.id(type + '-building-level-' + clIndex);

                    if (clIndex > result[type].levelValue) {
                        dom.updater.instantly(rowId, 'display', 'none');

                        dom.find('td.changed-animation', rowEl).iterate(function(el) {
                            el.classList.remove('changed-animation');
                        });
                    } else {
                        dom.updater.instantly(rowId, 'display', '');
                    }
                }

                result[type].objects.forEach(function(objectResult) {
                    dom.updater.defer(objectResult.name + '-summary', 'text',
                                      objectResult.summaryCost ? common.numberFormat(objectResult.summaryCost) : '');

                    if (type !== 'spells') {
                        var mcIndex = 0; // mc - max count
                        var mcLength = types.buildings[type].count;
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

        dom.updater.defer('grand-total', 'text', common.numberFormat(result.light.subtractedCost + result.spells.totalCost));

        dom.updater.runDeferred();
    });

    return function(type) {
        var params =  {
            'type': type,
            'storage': storage.current,
            'current': true
        };

        var calculateResult = calculate(params);
        if (storage.save()) {
            dom.triggerCustom('calculateDone', calculateResult);
        }
    };

});