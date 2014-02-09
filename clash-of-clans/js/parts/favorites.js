part('favorites', [
    'storage',
    'dom',
    'calculate',
    'common',
    'navigation',
    'goal',
    'calculateCurrent'
], function(storage, dom, calculate, common, navigation, goal, calculateCurrent) {

    'use strict';

    var viewSharedMessageHide = function() {
        dom.updater.instantly('view-shared', 'display', 'none');
    };

    var barracksAnchor = dom.id('light-anchor');

    var content = dom.id('favorites');
    var template = new Hogan.Template(/* build:hogan:mustache/favorites.mustache */);

    var loadHandler = function(e) {
        goal.reach('LOAD_SAVED');

        var dataToLoad = common.objectCopy(
            storage.all[e.currentTarget.getAttribute('data-num')].getAll()
        );
        storage.current = new common.Dict(dataToLoad);

        dom.triggerCustom('storageUpdated');
        calculateCurrent('all');

        viewSharedMessageHide();
        navigation.scrollTo(barracksAnchor);
    };

    var deleteHandler = function(e) {
        goal.reach('DELETE_SAVED');

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

        storage.all.splice(index, 1);
        storage.save();
    };

    var animationEndHandler = function(e) {
        e.currentTarget.classList.remove('favorite_added');
    };

    var addListeners = function(el, isRoot) {
        dom.find('.js-favorite-load', el).listen('universalClick', loadHandler);
        dom.find('.js-favorite-delete', el).listen('universalClick', deleteHandler);
        if (isRoot) {
            dom.listen(el, 'animationend', animationEndHandler);
        } else {
            dom.find('.js-favorite', el).listen('animationend', animationEndHandler);
        }
    };

    var favoritesCreateItem = function(data, index) {
        if (index === 0) {
            return;
        }
        var templateVars = {
            'index': index,
            'types': []
        };

        var result = calculate({
            'type': 'all',
            'current': false,
            'storage': data
        });

        var modifiers = {
            'light': 'elixir',
            'dark': 'dark-elixir',
            'spells': 'elixir'
        };

        ['light', 'dark', 'spells'].forEach(function(type) {
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

        var togetherSpace = result.light.totalSpace + result.dark.totalSpace;
        if (togetherSpace) {
            templateVars.types[0].totalCapacity = togetherSpace;
            templateVars.types[0].maximumCapacity = result.armyCampsSpace;
        }

        return template.render(templateVars);
    };

    var addedAnimation = function(index) {
        var composition = content.querySelector('.js-favorite[data-num="' + index + '"]');
        navigation.scrollTo(composition, function() {
            composition.classList.add('favorite_added');
        });
    };

    var add = function() {
        var output = {};

        var sourceData = storage.getRaw();
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

            var index = storage.all.length;
            var data = new common.Dict(common.objectCopy(storage.current.getAll()));
            storage.all.push(data);

            if (storage.save()) {
                content.insertAdjacentHTML('beforeend', favoritesCreateItem(data, index));
                addListeners(content.lastChild, true);

                output.added = true;
                output.index = index;
            } else {
                storage.all.pop();
            }
        }

        return output;
    };

    dom.find('.js-favorite-add').listen('universalClick', function(e) {
        e.preventDefault();
        var result = add(true);
        if (result.added) {
            goal.reach('SAVE_COMPOSITION', {'favoriteButton': e.target.textContent});
        }

        if (result.index) {
            addedAnimation(result.index);
        }
    });

    setTimeout(function() {
        content.innerHTML = storage.all.map(favoritesCreateItem).join('');
        addListeners(content);
    }, 0);

    var favoritesCount = storage.all.length;

    window.yandexMetrikaParams.favoritesCount = 'fc' + (favoritesCount ? favoritesCount - 1 : 0);

    return {
        'addBeforeShare': function() {
            var result = add();
            if (result.added || result.exists) {
                dom.listen(dom.id('view-shared'), 'universalClick', viewSharedMessageHide);
                dom.updater.instantly('view-shared', 'display', '');
            }
        }
    };

});