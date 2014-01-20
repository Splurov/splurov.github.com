part('favorites', [
    'savedData',
    'events',
    'dom',
    'calculate',
    'common',
    'navigation'
], function(savedData, events, dom, calculate, common, navigation) {

    'use strict';

    var tempDiv = document.createElement('div');

    var barracksAnchor = dom.id('barracks-anchor');

    var content = dom.id('favorites');
    var template = new Hogan.Template(/* build:hogan:mustache/favorites.mustache */);

    var loadHandler = function(e) {
        events.trigger('goal', {
            'id': 'LOAD_SAVED'
        }, true);

        var dataToLoad = common.objectCopy(
            savedData.all[e.currentTarget.getAttribute('data-num')].getAll()
        );
        savedData.current = new common.Dict(dataToLoad);

        events.trigger('updateFromSaved');
        events.trigger('calculate', {
            'type': 'all'
        });

        events.trigger('loaded');
        navigation.scrollTo(barracksAnchor);
    };

    var deleteHandler = function(e) {
        events.trigger('goal', {
            'id': 'DELETE_SAVED'
        }, true);

        var index = e.currentTarget.getAttribute('data-num');

        var el = content.querySelector('.js-favorite[data-num="' + index + '"]');
        dom.listen(el, 'transitionend', function() {
            el.parentNode.removeChild(el);

            dom.find('.js-favorite', content).iterate(function(item) {
                var oldIndex = parseInt(item.getAttribute('data-num'), 10);
                if (oldIndex > index) {
                    var newIndex = (oldIndex - 1).toString();
                    item.setAttribute('data-num', newIndex);
                    dom.find('[data-num]', item).iterate(function(sub) {
                        sub.setAttribute('data-num', newIndex);
                    });
                }
            });
        });
        el.classList.add('favorite_deleted');

        savedData.all.splice(index, 1);
        savedData.save();
    };

    var savedListCreateItem = function(data, index) {
        if (index === 0) {
            return;
        }
        var templateVars = {
            'index': index,
            'tabIndexLoad': index + 3000 + 1,
            'tabIndexDelete': index + 3000 + 2,
            'types': []
        };

        var result = calculate({
            'type': 'all',
            'current': false,
            'savedData': data
        });

        var modifiers = {
            'units': 'elixir',
            'dark': 'dark-elixir',
            'spells': 'elixir'
        };

        ['units', 'dark', 'spells'].forEach(function(type) {
            var items = [];

            if (type !== 'spells') {
                result[type].objects.sort(function(a, b) {
                    return a.minBarrackLevel - b.minBarrackLevel;
                });
            }

            result[type].objects.forEach(function(objectResult) {
                if (objectResult.quantity) {
                    items.push({
                        'name': common.convertToTitle(objectResult.name),
                        'quantity': objectResult.quantity
                    });
                }
            });

            if (items.length) {
                var data = {
                    'items': items,
                    'cost': common.numberFormat(result[type].totalCost),
                    'costModifier': modifiers[type]
                };

                if (type === 'spells') {
                    data.totalCapacity = result[type].totalSpace;
                    data.maximumCapacity = result[type].levelValue;
                    data.time = common.getFormattedTime(result[type].totalTime, true);
                } else {
                    var productionTime;
                    if (result[type].fillSuccess) {
                        productionTime = Math.max.apply(null, result[type].barracksQueue.map(function(barrack) {
                            return barrack.time;
                        }));
                        productionTime = common.getFormattedTime(productionTime);
                    }
                    data.time = productionTime;
                }

                templateVars.types.push(data);
            }

        });

        var togetherSpace = result.units.totalSpace + result.dark.totalSpace;
        if (togetherSpace) {
            templateVars.types[0].totalCapacity = togetherSpace;
            templateVars.types[0].maximumCapacity = result.armyCampsSpace;
        }

        return template.render(templateVars);
    };

    var addedAnimation = function(index) {
        var composition = content.querySelector('.js-favorite[data-num="' + index + '"]');
        navigation.scrollTo(composition, function() {
            dom.listen(composition, 'animationend', function() {
                composition.classList.remove('favorite_added');
            });
            composition.classList.add('favorite_added');
        });
    };

    var save = function() {
        var output = {};

        var sourceData = savedData.storage.load(true);
        if (sourceData[0]) {
            var currentJSON = JSON.stringify(sourceData[0]);
            var sdIndex = 0;
            var sdLength = sourceData.length;
            while (++sdIndex < sdLength) {
                var savedJSON = JSON.stringify(sourceData[sdIndex]);
                if (currentJSON === savedJSON) {
                    output.exists = true;
                    output.index = sdIndex;
                    return output;
                }
            }

            var index = savedData.all.length;
            var data = new common.Dict(common.objectCopy(savedData.current.getAll()));
            savedData.all.push(data);
            savedData.save();

            tempDiv.innerHTML = savedListCreateItem(data, index);
            dom.find('.js-favorite-load', tempDiv.firstChild).listen('universalClick', loadHandler);
            dom.find('.js-favorite-delete', tempDiv.firstChild).listen('universalClick', deleteHandler);
            content.appendChild(tempDiv.firstChild);

            output.added = true;
            output.index = index;
        }

        return output;
    };

    dom.find('.js-save-composition').listen('universalClick', function() {
        var result = save(true);
        if (result.added) {
            events.trigger('goal', {
                'id': 'SAVE_COMPOSITION'
            }, true);
        }

        if (result.index) {
            addedAnimation(result.index);
        }
    });

    content.innerHTML = savedData.all.map(savedListCreateItem).join('');
    dom.find('.js-favorite-load', content).listen('universalClick', loadHandler);
    dom.find('.js-favorite-delete', content).listen('universalClick', deleteHandler);

    var savedCount = savedData.all.length;
    events.trigger('goal', {
        'id': 'SAVED_COMPOSITIONS',
        'params': {
            'count': 'sc' + (savedCount ? savedCount - 1 : 0)
        }
    }, true);

    return {
        'add': function() {
            var result = save();
            return result.added || result.exists;
        }
    };

});