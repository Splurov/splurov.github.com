part([
    'savedData',
    'events',
    'dom',
    'calculate',
    'common'
], function(savedData, events, dom, calculate, common) {

    'use strict';

    var tempDiv = document.createElement('div');

    var content = dom.id('saved-list-content');
    var template = new Hogan.Template(/* build:hogan:mustache/saved_list_item.mustache */);

    var savedListCreateItem = function(data, index) {
        if (index === 0) {
            return;
        }
        var templateVars = {
            'index': index,
            'tabIndexLoad': index + 3000 + 1,
            'tabIndexDelete': index + 3000 + 2
        };

        var result = calculate({
            'type': 'all',
            'current': false,
            'savedData': data
        });

        ['units', 'dark'].forEach(function(type) {
            if (result[type]) {
                var items = [];
                result[type].objects.forEach(function(objectResult) {
                    if (objectResult.quantity > 0) {
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

        return template.render(templateVars);
    };

    var barracksAnchor = dom.id('barracks-anchor');
    dom.registerUniversalClickHandler('js-saved-load', function(e) {
        events.trigger('goal', {
            'id': 'LOAD_SAVED'
        }, true);

        var dataToLoad = common.objectCopy(
            savedData.all[e.target.getAttribute('data-num')].getAll()
        );
        savedData.current = new common.Dict(dataToLoad);

        events.trigger('updateFromSaved');
        events.trigger('calculate', {
            'type': 'all'
        });

        events.trigger('loaded');
        events.trigger('scrollTo', barracksAnchor);
    });

    dom.registerUniversalClickHandler('js-saved-delete', function(e) {
        events.trigger('goal', {
            'id': 'DELETE_SAVED'
        }, true);

        var index = e.target.getAttribute('data-num');

        var el = content.querySelector('.js-saved-item[data-num="' + index + '"]');
        el.classList.add('saved-list__item_deleted');
        setTimeout(function() {
            el.parentNode.removeChild(el);

            dom.find('.js-saved-item', content).iterate(function(item) {
                var oldIndex = parseInt(item.getAttribute('data-num'), 10);
                if (oldIndex > index) {
                    var newIndex = (oldIndex - 1).toString();
                    item.setAttribute('data-num', newIndex);
                    dom.find('[data-num]', item).iterate(function(sub) {
                        sub.setAttribute('data-num', newIndex);
                    });
                }
            });
        }, 500);

        savedData.all.splice(index, 1);
        savedData.save();
    });

    var addedAnimation = function(index) {
        var composition = content.querySelector('.js-saved-item[data-num="' + index + '"]');
        composition.classList.add('saved-list__item_added');
        setTimeout(function() {
            composition.classList.remove('saved-list__item_added');
        }, 2000);
        events.trigger('scrollTo', composition);
    };

    var save = function(isFully) {
        if (isFully) {
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
                    if (isFully) {
                        addedAnimation(sdIndex);
                    }
                    return;
                }
            }

            var index = savedData.all.length;
            var data = new common.Dict(common.objectCopy(savedData.current.getAll()));
            savedData.all.push(data);
            savedData.save();

            tempDiv.innerHTML = savedListCreateItem(data, index);
            content.appendChild(tempDiv.firstChild);
            if (isFully) {
                addedAnimation(index);
            }
        }
    };

    events.watch('saveTransparently', function() {
        save(false);
    });

    dom.registerUniversalClickHandler('js-save-composition', function() {
        save(true);
    });

    content.innerHTML = savedData.all.map(savedListCreateItem).join('');

    var savedCount = savedData.all.length;
    events.trigger('goal', {
        'id': 'SAVED_COMPOSITIONS',
        'params': {
            'count': 'sc' + (savedCount ? savedCount - 1 : 0)
        }
    }, true);

});