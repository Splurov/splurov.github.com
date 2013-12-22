(function(){

    'use strict';

    var barracksAnchor = mk.$id('barracks-anchor');
    var loadSaved = function(e) {
        mk.Events.trigger('goal', {
            'id': 'LOAD_SAVED'
        }, true);

        var dataToLoad = mk.objectCopy(
            mk.calc.savedDataAll.retrieve(e.currentTarget.getAttribute('data-num')).getAll()
        );
        mk.calc.savedData = new mk.Dict(dataToLoad);

        mk.Events.trigger('setDefaults');
        mk.Events.trigger('calculate', {
            'type': 'all',
            'computeAll': true
        });

        mk.Events.trigger('loaded');
        mk.Events.trigger('scrollTo', barracksAnchor);
    };

    var savedListItemTemplate = new Hogan.Template(/* build:hogan:mustache/saved_list_item.mustache */);
    var savedListCreateItems = function() {
        var content = [];
        mk.calc.savedDataAll.forEach(function(data, index) {
            if (index === 0) {
                return;
            }
            var templateVars = {
                'index': index,
                'tabIndexLoad': index + 3000 + 1,
                'tabIndexDelete': index + 3000 + 2
            };

            var totalCapacity = 0;

            mk.objectIterate(mk.calc.barracksData, function(type, barracksData) {
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

                mk.calc.typesSortedLevel[type].forEach(function(troopsData, tsIndex) {
                    var quantity = parseInt(data.get(troopsData[5]), 10) || 0;
                    if (quantity > 0 && troopsData[3] <= level) {
                        items.push({
                            'name': mk.convertToTitle(troopsData[5]),
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
                    if (mk.calc.fillBarracks(barracksQueue, distribution, avgTime)) {
                        productionTime = Math.max.apply(null, barracksQueue.map(function(barrack) {
                            return barrack.time;
                        }));
                        productionTime = mk.getFormattedTime(productionTime);
                    }

                    templateVars[type] = {
                        'items': items.sort(function(a, b) {
                            return a.level > b.level;
                        }),
                        'cost': mk.numberFormat(cost),
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
                mk.objectIterate(mk.calc.types.spells, function(spellName, spellValue) {
                    var spellQuantity = parseInt(data.get(spellName), 10) || 0;
                    if (spellQuantity > 0 && spellValue[3] <= spellFactoryLevel) {
                        spellsItems.push({
                            'name': mk.convertToTitle(spellName),
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
                        'spellsCost': mk.numberFormat(spellsCost),
                        'spellsCapacity': spellsCapacity,
                        'spellsFactoryLevel': spellFactoryLevel,
                        'spellsTime': mk.getFormattedTime(spellsTime, true)
                    };
                }
            }

            content.push(savedListItemTemplate.render(templateVars));
        });

        var savedListContent = mk.$id('saved-list-content');
        savedListContent.innerHTML = content.join('');

        mk.$('.js-saved-load', savedListContent).listen(['click'], loadSaved);

        var deleteSaved = function(e) {
            mk.Events.trigger('goal', {
                'id': 'DELETE_SAVED'
            }, true);
            mk.calc.savedDataAll.remove(e.currentTarget.getAttribute('data-num'));
            mk.calc.savedDataStorage.save(mk.calc.savedDataAll.getAll());
            savedListCreateItems();
        };

        mk.$('.js-saved-delete', savedListContent).listen(['click'], deleteSaved);
    };

    var alreadySavedMessage = mk.infoMessage('already-saved', true);
    var savedCalculationAnchor = mk.$id('saved-anchor');

    var save = function(customParams) {
        var params = {
            'showMessage': true
        };
        mk.objectIterate(customParams, function(key, value) {
            params[key] = value;
        });
        alreadySavedMessage.hide();

        if (params.showMessage) {
            mk.Events.trigger('goal', {
                'id': 'SAVE_COMPOSITION'
            }, true);
        }

        var sourceData = mk.calc.savedDataStorage.load(true);
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

            var dataToSave = mk.objectCopy(mk.calc.savedData.getAll());
            mk.calc.savedDataAll.insert(dataToSave);
            mk.calc.savedDataStorage.save(mk.calc.savedDataAll.getAll());
            savedListCreateItems();
        }
    };

    mk.Events.listen('save', save);

    var saveHandler = function(e) {
        if (e.currentTarget.getAttribute('data-scroll') === 'yes') {
            mk.Events.trigger('scrollTo', savedCalculationAnchor);
        }

        save();
    };

    mk.$('.js-save-composition').listen(['click'], saveHandler);

    savedListCreateItems();

    var savedCount = mk.calc.savedDataAll.getLength();
    mk.Events.trigger('goal', {
        'id': 'SAVED_COMPOSITIONS',
        'params': {
            'count': (savedCount ? savedCount - 1 : 0)
        }
    }, true);

}());