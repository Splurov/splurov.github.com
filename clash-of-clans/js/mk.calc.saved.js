(function(window, document, mk){

    'use strict';

    //var savedListItemTemplate = templates.saved_list_item;
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

            var unitsItems = [];
            var totalCost = 0;
            var totalCapacity = 0;
            var barracksLevels = [];
            var barracksIndex;
            var barracksCount;
            for (barracksIndex = 1, barracksCount = 4; barracksIndex <= barracksCount; barracksIndex++) {
                barracksLevels.push(data.get('barracks-levels-' + barracksIndex, 10));
            }
            mk.objectIterate(mk.calc.types.units, function(name, unitValue) {
                var quantity = parseInt(data.get(name), 10) || 0;
                var barracksLevel = Math.max.apply(null, barracksLevels.map(function(barrackIndex, arrayIndex) {
                    return (arrayIndex === 0 ? barrackIndex + 1 : barrackIndex);
                }));
                if (quantity > 0 && unitValue[3] <= barracksLevel) {
                    unitsItems.push({
                        'name': mk.convertToTitle(name),
                        'quantity': quantity
                    });
                    totalCost += unitValue[1][data.get(name + '-level')] * quantity;
                    totalCapacity += unitValue[2] * quantity;
                }
            });
            if (unitsItems.length) {
                templateVars.hasUnits = {
                    'units': unitsItems,
                    'totalCost': mk.numberFormat(totalCost)
                };
            }

            var darkBarracksLevels = [];
            var darkBarracksIndex;
            var darkBarracksCount;
            for (darkBarracksIndex = 1, darkBarracksCount = 2; darkBarracksIndex <= darkBarracksCount; darkBarracksIndex++) {
                darkBarracksLevels.push(data.get('dark-barracks-levels-' + darkBarracksIndex, 5));
            }
            var darkBarracksLevel = Math.max.apply(null, darkBarracksLevels);
            if (darkBarracksLevel > 0) {
                var darkItems = [];
                var darkCost = 0;
                mk.objectIterate(mk.calc.types.dark, function(name, unitValue) {
                    var quantity = parseInt(data.get(name), 10) || 0;
                    if (quantity > 0 && unitValue[3] <= darkBarracksLevel) {
                        darkItems.push({
                            'name': mk.convertToTitle(name),
                            'quantity': quantity
                        });
                        darkCost += unitValue[1][data.get(name + '-level')] * quantity;
                        totalCapacity += unitValue[2] * quantity;
                    }
                });
                if (darkItems.length) {
                    templateVars.hasDark = {
                        'dark': darkItems,
                        'darkCost': mk.numberFormat(darkCost)
                    };
                }
            }

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
                mk.objectIterate(mk.calc.types.spells, function(spellName, spellValue) {
                    var spellQuantity = parseInt(data.get(spellName), 10) || 0;
                    if (spellQuantity > 0 && spellValue[3] <= data.get('spellFactoryLevel')) {
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
                        'spellsFactoryLevel': data.get('spellFactoryLevel')
                    };
                }
            }

            content.push(savedListItemTemplate.render(templateVars));
        });

        var savedListContent = document.getElementById('saved-list-content');
        savedListContent.innerHTML = content.join('');

        var barracksAnchor = document.getElementById('barracks-anchor');

        var loadSaved = function(e) {
            e.preventDefault();
            e.stopPropagation();

            var dataToLoad = mk.objectCopy(mk.calc.savedDataAll.retrieve(e.currentTarget.getAttribute('data-num')).getAll());
            mk.calc.savedData = new mk.Dict(dataToLoad);

            mk.calc.setDefaults();
            mk.calc.calculate('all');
            savedListCreateItems();

            mk.calc.smoothScroll(barracksAnchor);
        };

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

    mk.calc.save = function(customParams) {
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
                    return false;
                }
            }

            var dataToSave = mk.objectCopy(mk.calc.savedData.getAll());
            mk.calc.savedDataAll.insert(dataToSave);
            mk.calc.savedDataStorage.save(mk.calc.savedDataAll.getAll());
            savedListCreateItems();
            return true;
        }
    };

    var saveHandler = function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (e.currentTarget.getAttribute('data-scroll') === 'yes') {
            mk.calc.smoothScroll(savedCalculationAnchor);
        }

        mk.calc.save(true);
    };

    mk.getAllByClass('js-save-composition').forEach(function(saveEl) {
        mk.addEvents(saveEl, ['click', 'touchend'], saveHandler);
    });

    savedListCreateItems();

}(window, document, window.mk));