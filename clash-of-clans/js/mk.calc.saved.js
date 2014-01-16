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

            var result = calculate(data);

            ['units', 'dark'].forEach(function(type) {
                if (result[type]) {
                    var items = [];
                    result[type].objects.forEach(function(objectResult) {
                        if (objectResult.quantity > 0) {
                            console.log(objectResult.level);
                            items.push({
                                'name': common.convertToTitle(objectResult.name),
                                'quantity': objectResult.quantity,
                                'minBarrackLevel': objectResult.minBarrackLevel
                            });
                        }
                    });

                    if (items.length) {
                        var productionTime;
                        if (result[type].fillSuccess) {
                            productionTime = Math.max.apply(null, result[type].barracksQueue.map(function(barrack) {
                                return barrack.time;
                            }));
                            productionTime = common.getFormattedTime(productionTime);
                        }

                        templateVars[type] = {
                            'items': items.sort(function(a, b) {
                                return a.minBarrackLevel > b.minBarrackLevel;
                            }),
                            'cost': common.numberFormat(result[type].totalCost),
                            'time': productionTime
                        };
                    }
                }

                var togetherSpace = result.units.totalSpace + result.dark.totalSpace;
                if (togetherSpace > 0) {
                    templateVars.hasCapacity = {
                        'totalCapacity': togetherSpace,
                        'armyCamps': result.armyCampsSpace
                    };
                }
            });

            if (result.spells) {
                var spells = [];

                result.spells.objects.forEach(function(objectResult) {
                    if (objectResult.quantity > 0) {
                        spells.push({
                            'name': common.convertToTitle(objectResult.name),
                            'quantity': objectResult.quantity
                        });
                    }
                });

                if (spells.length) {
                    templateVars.hasSpells = {
                        'spells': spells,
                        'spellsCost': common.numberFormat(result.spells.totalCost),
                        'spellsCapacity': result.spells.totalSpace,
                        'spellsFactoryLevel': result.spells.levelValue,
                        'spellsTime': common.getFormattedTime(result.spells.totalTime, true)
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