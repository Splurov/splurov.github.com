(function(window, document, mk){

    'use strict';

    var savedListItemTemplate = templates.saved_list_item;
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
            var barracksLevels = data.get('barracksLevels', [10, 10, 10, 10]);
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
                }
            });
            if (unitsItems.length) {
                templateVars.hasUnits = {
                    'units': unitsItems,
                    'totalCost': mk.numberFormat(totalCost)
                };
            }

            var darkBarracksLevels = data.get('darkBarracksLevels', [4, 4]);
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
                    }
                });
                if (darkItems.length) {
                    templateVars.hasDark = {
                        'dark': darkItems,
                        'darkCost': mk.numberFormat(darkCost)
                    };
                }
            }

            if (data.get('spellFactoryLevel') > 0) {
                var spellsItems = [];
                var spellsCost = 0;
                mk.objectIterate(mk.calc.types.spells, function(spellName, spellValue) {
                    var spellQuantity = parseInt(data.get(spellName), 10) || 0;
                    if (spellQuantity > 0 && spellValue[3] <= data.get('spellFactoryLevel')) {
                        spellsItems.push({
                            'name': mk.convertToTitle(spellName),
                            'quantity': spellQuantity
                        });
                        spellsCost += spellValue[1][data.get(spellName + '-level')] * spellQuantity;
                    }
                });
                if (spellsItems.length) {
                    templateVars.hasSpells = {
                        'spells': spellsItems,
                        'spellsCost': mk.numberFormat(spellsCost),
                    };
                }
            }

            content.push(savedListItemTemplate.render(templateVars));
        });

        var savedListContent = document.getElementById('saved-list-content');
        savedListContent.innerHTML = content.join('');

        var loadSaved = function(e) {
            e.preventDefault();
            e.stopPropagation();

            var dataToLoad = mk.objectCopy(mk.calc.savedDataAll.retrieve(e.target.getAttribute('data-num')).getAll());
            mk.calc.savedData = new mk.Dict(dataToLoad);

            mk.calc.setDefaults();
            mk.calc.calculate('all');
            savedListCreateItems();
        };

        mk.toArray(savedListContent.getElementsByClassName('js-saved-load')).forEach(function(el) {
            el.addEventListener('click', loadSaved, false);
            el.addEventListener('touchend', loadSaved, false);
        });

        var deleteSaved = function(e) {
            e.preventDefault();
            e.stopPropagation();
            mk.calc.savedDataAll.remove(e.target.getAttribute('data-num'));
            mk.calc.savedDataStorage.save(mk.calc.savedDataAll.getAll());
            savedListCreateItems();
        };

        mk.toArray(savedListContent.getElementsByClassName('js-saved-delete')).forEach(function(el) {
            el.addEventListener('click', deleteSaved, false);
            el.addEventListener('touchend', deleteSaved, false);
        });
    };

    var alreadySavedMessage = mk.infoMessage('already-saved', true);

    mk.calc.save = function(e, isShowMessage) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();

            e.target.blur();
        }
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
                    if (isShowMessage !== false) {
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

    var saveEl = document.getElementById('save');
    saveEl.addEventListener('click', mk.calc.save, false);
    saveEl.addEventListener('touchend', mk.calc.save, false);
    saveEl.addEventListener('keydown', function(e) {
        var code = e.keyCode || e.which;
        if (code === 13) {
            mk.calc.save();
        }
    }, false);

    savedListCreateItems();

}(window, document, window.mk));