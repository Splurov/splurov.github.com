(function(mk, Hogan){

    'use strict';

    var barracksAnchor = document.getElementById('barracks-anchor');
    var loadSaved = function(e) {
        e.preventDefault();
        e.stopPropagation();

        var dataToLoad = mk.objectCopy(
            mk.calc.savedDataAll.retrieve(e.currentTarget.getAttribute('data-num')).getAll()
        );
        mk.calc.savedData = new mk.Dict(dataToLoad);

        mk.Events.trigger('setDefaults');
        mk.Events.trigger('calculate', 'all');

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

                var levels = [];
                var i;
                for (i = 1; i < barracksData.count; i++) {
                    levels.push(data.get(barracksData.prefix + '-levels-' + i, barracksData.maxLevel));
                }

                mk.objectIterate(mk.calc.types[type], function(name, troopsData) {
                    var quantity = parseInt(data.get(name), 10) || 0;
                    var level = Math.max.apply(null, levels.map(function(barrackIndex, arrayIndex) {
                        return (arrayIndex === 0 ? barrackIndex + 1 : barrackIndex);
                    }));
                    if (quantity > 0 && troopsData[3] <= level) {
                        items.push({
                            'name': mk.convertToTitle(name),
                            'quantity': quantity
                        });
                        cost += troopsData[1][data.get(name + '-level')] * quantity;
                        totalCapacity += troopsData[2] * quantity;
                    }
                });

                if (items.length) {
                    templateVars[type] = {
                        'items': items,
                        'cost': mk.numberFormat(cost)
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
                mk.objectIterate(mk.calc.types.spells, function(spellName, spellValue) {
                    var spellQuantity = parseInt(data.get(spellName), 10) || 0;
                    if (spellQuantity > 0 && spellValue[3] <= spellFactoryLevel) {
                        spellsItems.push({
                            'name': mk.convertToTitle(spellName),
                            'quantity': spellQuantity
                        });
                        spellsCost += spellValue[1][data.get(spellName + '-level')] * spellQuantity;
                        spellsCapacity += spellValue[2] * spellQuantity;
                    }
                });
                if (spellsItems.length) {
                    templateVars.hasSpells = {
                        'spells': spellsItems,
                        'spellsCost': mk.numberFormat(spellsCost),
                        'spellsCapacity': spellsCapacity,
                        'spellsFactoryLevel': spellFactoryLevel
                    };
                }
            }

            content.push(savedListItemTemplate.render(templateVars));
        });

        var savedListContent = document.getElementById('saved-list-content');
        savedListContent.innerHTML = content.join('');

        mk.getAllByClass('js-saved-load', savedListContent).forEach(function(el) {
            mk.addEvents(el, ['click', 'touchend'], loadSaved);
        });

        var deleteSaved = function(e) {
            e.preventDefault();
            e.stopPropagation();
            mk.calc.savedDataAll.remove(e.currentTarget.getAttribute('data-num'));
            mk.calc.savedDataStorage.save(mk.calc.savedDataAll.getAll());
            savedListCreateItems();
        };

        mk.getAllByClass('js-saved-delete', savedListContent).forEach(function(el) {
            mk.addEvents(el, ['click', 'touchend'], deleteSaved);
        });
    };

    var alreadySavedMessage = mk.infoMessage('already-saved', true);
    var savedCalculationAnchor = document.getElementById('saved-anchor');

    var save = function(customParams) {
        var defaultParams = {
            'showMessage': true
        };
        var params = mk.objectExtend(defaultParams, customParams);
        alreadySavedMessage.hide();

        var sourceData = mk.calc.savedDataStorage.load(true);
        if (sourceData[0]) {
            mk.calc.saveMappingKeys.forEach(function(key, index) {
                if (key.indexOf('subtract') !== -1) {
                    sourceData[0][index] = 0;
                }
            });
            var currentJSON = JSON.stringify(sourceData[0]);
            var sdIndex;
            var sdLength;
            for (sdIndex = 1, sdLength = sourceData.length; sdIndex < sdLength; sdIndex++) {
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
        e.preventDefault();
        e.stopPropagation();

        if (e.currentTarget.getAttribute('data-scroll') === 'yes') {
            mk.Events.trigger('scrollTo', savedCalculationAnchor);
        }

        save();
    };

    mk.getAllByClass('js-save-composition').forEach(function(saveEl) {
        mk.addEvents(saveEl, ['click', 'touchend'], saveHandler);
    });

    savedListCreateItems();

}(window.mk, window.Hogan));