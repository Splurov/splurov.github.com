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
                        dom.updater.defer('quantity-' + distributionResult.typesSorted[unitIndex][5] + '-' +
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

            var isFirstSpace = true;
            spaces.forEach(function(space, num) {
                var barrackSpaceId = type + '-space-' + num;
                if (space === 0) {
                    dom.updater.defer(barrackSpaceId, 'text', '');
                } else {
                    if (isFirstSpace) {
                        isFirstSpace = false;
                        space += distributionResult.totalSpace - sumSpace;
                        dom.updater.defer(barrackSpaceId, 'html',
                                          '<span class="limit-exceeded result">' + space + '</span> / ');

                    } else {
                        dom.updater.defer(barrackSpaceId, 'text', space + ' / ');
                    }
                }
            });
        }
    };

    dom.listenCustom('calculateDone', function(result) {
        /*
        Types:
            all
            barrack-dark
            barrack-light
            units
            dark
            light-spells
            dark-spells
         */

        if (result.params.type === 'all' || ['light-spells', 'dark-spells'].indexOf(result.params.type) === -1) {
            var togetherSpace = result.light.totalSpace + result.dark.totalSpace;
            setQuantityAndSpace(result.armyCampsSpace, togetherSpace, 'light');
            setQuantityAndSpace(result.armyCampsSpace, togetherSpace, 'dark');
        }

        if (result.params.type === 'all' || ['light-spells', 'dark-spells'].indexOf(result.params.type) !== -1) {
            var spellsTotal = (result['light-spells'].levelValue * 2) + (result['dark-spells'].levelValue ? 1 : 0);
            var spellsTogether = result['light-spells'].totalSpace + result['dark-spells'].totalSpace;
            setQuantityAndSpace(spellsTotal, spellsTogether, 'light-spells');
            setQuantityAndSpace(spellsTotal, spellsTogether, 'dark-spells');

            ['light-spells', 'dark-spells'].forEach(function(type) {
                var spellsTimeId = type + '-time';
                var spellsTimeValue = '';
                if (result[type].totalTime) {
                    if (localStorage.getItem(type + '-boosted') === 'yes') {
                        spellsTimeValue = '<span class="boosted">' +
                                          common.getFormattedTime(Math.floor(result[type].totalTime / 4), true) +
                                          '</span>';
                    } else {
                        spellsTimeValue = common.getFormattedTime(result[type].totalTime, true);
                    }

                }
                dom.updater.defer(spellsTimeId, 'html', spellsTimeValue);
            });
        }

        ['light', 'dark', 'light-spells', 'dark-spells'].forEach(function(type) {
            if (['all', 'barrack-' + type, type].indexOf(result.params.type) !== -1) {
                var objects = dom.findCache('.js-' + type + '-object');
                objects.iterate(function(el) {
                    el.style.display = (result[type].levelValue === 0 ? 'none' : '');
                });

                Object.keys(types.data[type]).forEach(function(name) {
                    var item = types.data[type][name];

                    var rowId = type + '-building-level-' + name;
                    var rowEl = dom.id(type + '-building-level-' + name);

                    if (item[3] > result[type].levelValue) {
                        dom.updater.instantly(rowId, 'display', 'none');

                        dom.find('td.changed-animation', rowEl).iterate(function(el) {
                            el.classList.remove('changed-animation');
                        });
                    } else {
                        dom.updater.instantly(rowId, 'display', '');
                    }
                });

                result[type].objects.forEach(function(objectResult, index) {
                    dom.updater.defer(objectResult.name + '-summary', 'text',
                                      objectResult.summaryCost ? common.numberFormat(objectResult.summaryCost) : '');

                    if (['light-spells', 'dark-spells'].indexOf(type) === -1) {
                        var mcIndex = 0; // mc - max count
                        var mcLength = types.buildings[type].count;
                        while (++mcIndex <= mcLength) {
                            dom.updater.defer('quantity-' + objectResult.name + '-' + mcIndex, 'text', '');
                        }
                    }
                });

                dom.updater.defer(type + '-cost', 'text', common.numberFormat(result[type].totalCost));

                if (['light-spells', 'dark-spells'].indexOf(type) === -1) {
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

        dom.updater.defer('light-spells-grand-total', 'text',
                          common.numberFormat(result.light.subtractedCost + result['light-spells'].totalCost));

        dom.updater.defer('dark-spells-grand-total', 'text',
                          common.numberFormat(result.dark.subtractedCost + result['dark-spells'].totalCost));

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