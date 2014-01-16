part(['savedData', 'types', 'events', 'dom', 'barracks', 'calculate', 'common'],
     function(savedData, types, events, dom, barracks, calculate, common) {

    'use strict';

    var barracksAnchor = dom.id('barracks-anchor');
    var loadSaved = function(e) {
        events.trigger('goal', {
            'id': 'LOAD_SAVED'
        }, true);

        var dataToLoad = common.objectCopy(
            savedData.all.retrieve(e.currentTarget.getAttribute('data-num')).getAll()
        );
        savedData.current = new common.Dict(dataToLoad);

        events.trigger('updateFromSaved');
        events.trigger('calculate', {
            'type': 'all',
            'computeAll': true
        });

        events.trigger('loaded');
        events.trigger('scrollTo', barracksAnchor);
    };

    var savedListItemTemplate = new Hogan.Template(/* build:hogan:mustache/saved_list_item.mustache */);
    var savedListCreateItems = function() {
        var content = [];
        savedData.all.forEach(function(data, index) {
            if (index === 0) {
                return;
            }
            var templateVars = {
                'index': index,
                'tabIndexLoad': index + 3000 + 1,
                'tabIndexDelete': index + 3000 + 2
            };

            var totalCapacity = 0;

            Object.keys(barracks).forEach(function(type) {
                var barracksData = barracks[type].data;

                var items = [];
                var cost = 0;
                var time = 0;

                var barracksQueue = [];
                var barracksCount = 0;
                var maxUnitTime = 0;
                var distribution = [];

                var level = 0;
                var i = 0;
                while (++i <= barracksData.count) {
                    var barrackLevel = data.get(barracksData.prefix + '-levels-' + i, barracksData.maxLevel);
                    if (i === 1 && barracksData.firstRequired) {
                        barrackLevel++;
                    }
                    if (barrackLevel > level) {
                        level = barrackLevel;
                    }

                    barracksQueue.push({
                        'num': i,
                        'time': 0,
                        'space': 0,
                        'maxSpace': barracksData.queue[barrackLevel],
                        'units': {},
                        'level': barrackLevel,
                        'isBoosted': function() {
                            return false;
                        },
                        'getActualTime': function() {
                            return this.time;
                        }
                    });

                    if (barrackLevel > 0) {
                        barracksCount++;
                    }
                }

                calculate.typesSortedLevel[type].forEach(function(troopsData, tsIndex) {
                    var quantity = parseInt(data.get(troopsData[5]), 10) || 0;
                    if (quantity > 0 && troopsData[3] <= level) {
                        items.push({
                            'name': common.convertToTitle(troopsData[5]),
                            'quantity': quantity,
                            'level': troopsData[3]
                        });
                        cost += troopsData[1][data.get(troopsData[5] + '-level')] * quantity;
                        totalCapacity += troopsData[2] * quantity;
                        time += troopsData[0] * quantity;
                        maxUnitTime = Math.max(troopsData[0], maxUnitTime);

                        distribution.push([
                            tsIndex,
                            quantity,
                            troopsData[3], // level
                            troopsData[0], // time
                            troopsData[2] // space
                        ]);
                    }
                });

                if (items.length) {
                    var avgTime = Math.max(Math.ceil(time / barracksCount), maxUnitTime);
                    var productionTime;
                    if (calculate.fillBarracks(barracksQueue, distribution, avgTime, barracksCount)) {
                        productionTime = Math.max.apply(null, barracksQueue.map(function(barrack) {
                            return barrack.time;
                        }));
                        productionTime = common.getFormattedTime(productionTime);
                    }

                    templateVars[type] = {
                        'items': items.sort(function(a, b) {
                            return a.level > b.level;
                        }),
                        'cost': common.numberFormat(cost),
                        'time': productionTime
                    };
                }
            });

            if (totalCapacity > 0) {
                templateVars.hasCapacity = {
                    'totalCapacity': totalCapacity,
                    'armyCamps': data.get('armyCamps')
                };
            }

            if (data.get('spellFactoryLevel') > 0) {
                var spellsItems = [];
                var spellsCost = 0;
                var spellsCapacity = 0;
                var spellFactoryLevel = data.get('spellFactoryLevel');
                var spellsTime = 0;
                Object.keys(types.data.spells).forEach(function(spellName) {
                    var spellValue = types.data.spells[spellName];

                    var spellQuantity = parseInt(data.get(spellName), 10) || 0;
                    if (spellQuantity > 0 && spellValue[3] <= spellFactoryLevel) {
                        spellsItems.push({
                            'name': common.convertToTitle(spellName),
                            'quantity': spellQuantity
                        });
                        spellsCost += spellValue[1][data.get(spellName + '-level')] * spellQuantity;
                        spellsCapacity += spellValue[2] * spellQuantity;
                        spellsTime += spellValue[0] * spellQuantity;
                    }
                });
                if (spellsItems.length) {
                    templateVars.hasSpells = {
                        'spells': spellsItems,
                        'spellsCost': common.numberFormat(spellsCost),
                        'spellsCapacity': spellsCapacity,
                        'spellsFactoryLevel': spellFactoryLevel,
                        'spellsTime': common.getFormattedTime(spellsTime, true)
                    };
                }
            }

            content.push(savedListItemTemplate.render(templateVars));
        });

        var savedListContent = dom.id('saved-list-content');
        savedListContent.innerHTML = content.join('');

        dom.find('.js-saved-load', savedListContent).listen(['universalClick'], loadSaved);

        var deleteSaved = function(e) {
            events.trigger('goal', {
                'id': 'DELETE_SAVED'
            }, true);
            savedData.all.remove(e.currentTarget.getAttribute('data-num'));
            savedData.save();
            savedListCreateItems();
        };

        dom.find('.js-saved-delete', savedListContent).listen(['universalClick'], deleteSaved);
    };

    var alreadySavedMessage = common.infoMessage('already-saved', true);
    var savedCalculationAnchor = dom.id('saved-anchor');

    var save = function(customParams) {
        var params = {
            'showMessage': true
        };
        Object.keys(customParams).forEach(function(key) {
            params[key] = customParams[key];
        });
        alreadySavedMessage.hide();

        if (params.showMessage) {
            events.trigger('goal', {
                'id': 'SAVE_COMPOSITION'
            }, true);
        }

        var sourceData = savedData.storage.load(true);
        if (sourceData[0]) {
            var currentJSON = JSON.stringify(sourceData[0]);
            var sdIndex = 0;
            var sdLength = sourceData.length;
            while (++sdIndex < sdLength) {
                var savedJSON = JSON.stringify(sourceData[sdIndex]);
                if (currentJSON === savedJSON) {
                    if (params.showMessage) {
                        alreadySavedMessage.show();
                    }
                    return;
                }
            }

            var dataToSave = common.objectCopy(savedData.current.getAll());
            savedData.all.insert(dataToSave);
            savedData.save();
            savedListCreateItems();
        }
    };

    events.listen('save', save);

    var saveHandler = function(e) {
        if (e.currentTarget.getAttribute('data-scroll') === 'yes') {
            events.trigger('scrollTo', savedCalculationAnchor);
        }

        save();
    };

    dom.find('.js-save-composition').listen(['universalClick'], saveHandler);

    savedListCreateItems();

    var savedCount = savedData.all.getLength();
    events.trigger('goal', {
        'id': 'SAVED_COMPOSITIONS',
        'params': {
            'count': 'sc' + (savedCount ? savedCount - 1 : 0)
        }
    }, true);

});