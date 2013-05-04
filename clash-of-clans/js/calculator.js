(function(window, document) {

    'use strict';


    var toArray = function(likeArrayObject) {
        var resultArray = [];
        var i;
        var l;
        for (i = 0, l = likeArrayObject.length; i < l; i++) {
            resultArray.push(likeArrayObject[i]);
        }
        return resultArray;
    };


    if (!Function.prototype.bind) {
        Function.prototype.bind = function(context) {
            var self = this;
            var args = toArray(arguments).slice(1);
            return function() {
                return self.apply(context, args.concat(toArray(arguments)));
            };
        };
    }


    var objectIterate = function(obj, callback) {
        var key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (callback(key, obj[key]) === false) {
                    break;
                }
            }
        }
    };


    var objectCopy = function(obj) {
        var newObj = obj.constructor();
        objectIterate(obj, function(key, value) {
            newObj[key] = value;
        });
        return newObj;
    };


    var numberFormat = function(n) {
        return n.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    };


    var convertToTitle = function(s) {
        return s.replace('_', ' ').replace(/-/g, '.');
    };


    var getWikiaLink = function(s, isSpell) {
        return 'http://clashofclans.wikia.com/wiki/' + s.replace(' ', '_') + (isSpell ? '_Spell' : '');
    };


    var getFormattedTime = function(time, hideSeconds) {
        var formattedTime = '';
        var remainingTime = time;
        if (remainingTime > 3599) {
            formattedTime += Math.floor(remainingTime / 3600) + 'h ';
            remainingTime %= 3600;
        }
        if (remainingTime > 59) {
            var minutes = Math.floor(remainingTime / 60);
            remainingTime %= 60;
            if (hideSeconds && remainingTime > 0) {
                minutes++;
            }
            formattedTime += minutes + 'm ';
        } else {
            formattedTime += '0m ';
        }
        if (formattedTime === '' || !hideSeconds) {
            formattedTime += remainingTime + 's';
        }
        return formattedTime;
    };


    var DataStorage = function(key, defaultData) {
        this.key = key;
        this.defaultData = defaultData;

        this.load = function() {
            var data = window.localStorage.getItem(this.key);
            return (data && JSON.parse(data)) || this.defaultData;
        };

        this.save = function(data) {
            window.localStorage.setItem(this.key, JSON.stringify(data));
        };
    };


    var Dict = function(data) {
        this.data = data;

        this.get = function(key, defaultValue) {
            var value = this.data[key];
            if (defaultValue !== undefined && value === undefined) {
                return defaultValue;
            }
            return value;
        };

        this.set = function(key, value) {
            this.data[key] = value;
        };

        this.getAll = function() {
            return this.data;
        };
    };

    var MultiDict = function(entries) {
        this.entries = [];

        this.retrieve = function(i) {
            return this.entries[i];
        };

        this.insert = function(data) {
            this.entries.push(new Dict(data));
        };

        this.remove = function(i) {
            this.entries.splice(i, 1);
        };

        this.getAll = function() {
            return this.entries.map(function(entry) {
                return entry.getAll();
            });
        };

        this.forEach = function(callback) {
            this.entries.forEach(callback);
        };

        entries.forEach(this.insert.bind(this));
    };


    var IdsCacher = function() {
        this.elements = {};
        this.get = function(id) {
            if (!this.elements.hasOwnProperty(id)) {
                this.elements[id] = document.getElementById(id);
            }
            return this.elements[id];
        };
    };


    var ids = new IdsCacher();


    var savedDataStorage = new DataStorage('savedData', {});
    var savedData = new Dict(savedDataStorage.load());

    var BarracksContainer = function(maxCount, selectName, saveName, queueLengths) {
        this.barracks = [];
        this.maxCount = maxCount;
        this.saveName = saveName;
        this.queueLengths = queueLengths;

        var i;
        for (i = 1; i <= this.maxCount; i++) {
            var barrack = ids.get(selectName + '-' + i);
            this.barracks.push(barrack);
        }

        this.setDefaults = function() {
            var saved = savedData.get(this.saveName);
            if (saved) {
                this.barracks.forEach(function(el, i) {
                    el.options[saved[i]].selected = true;
                });
            }
        };

        this.updateSavedData = function() {
            savedData.set(this.saveName, this.barracks.map(function(el) {
                return el.selectedIndex;
            }));
        };

        this.getMaxLevel = function() {
            return Math.max.apply(null, this.barracks.map(function(el) {
                return parseInt(el.value, 10);
            }));
        };

        this.getAllNormalized = function() {
            return this.barracks.map(function(el) {
                return {
                    'id': el.getAttribute('id'),
                    'level': el.value,
                    'queueLength': this.queueLengths[el.value]
                };
            }, this);
        };

        this.getElements = function() {
            return this.barracks;
        };

        this.getMaxCount = function() {
            return this.maxCount;
        };

        this.getCapLevel = function() {
            return this.barracks[0].options[this.barracks[0].options.length - 1].value;
        };

        this.getActiveCount = function() {
            return this.barracks.filter(function(b){
                return b.value > 0;
            }).length;
        };
    };

    var allBarracks = {
        'units': new BarracksContainer(
            4,
            'barracks-levels',
            'barracksLevels',
            [0, 20, 25, 30, 35, 40, 45, 50, 55, 60, 75]
        ),
        'dark': new BarracksContainer(
            2,
            'dark-barracks-levels',
            'darkBarracksLevels',
            [0, 40, 50, 60, 70]
        )
    };

    var armyCamps = ids.get('army-camps');
    var spellFactoryLevel = ids.get('spell-factory-level');


    var types = {
        'units': {
            'Barbarian': [20, [25, 40, 60, 80, 100, 150], 1, 1],
            'Archer': [25, [50, 80, 120, 160, 200, 300], 1, 2],
            'Goblin': [30, [25, 40, 60, 80, 100], 1, 3],
            'Giant': [120, [500, 1000, 1500, 2000, 2500, 3000], 5, 4],
            'Wall_Breaker': [120, [1000, 1500, 2000, 2500, 3000], 2, 5],
            'Balloon': [600, [2000, 2500, 3000, 3500, 4000, 4500], 5, 6],
            'Wizard': [600, [1500, 2000, 2500, 3000, 3500], 4, 7],
            'Healer': [1200, [7000, 10000, 13000], 20, 8],
            'Dragon': [1800, [25000, 30000, 36000], 20, 9],
            'P-E-K-K-A-': [2700, [30000, 35000, 42000], 25, 10]
        },
        'spells': {
            'Lightning': [1800, [15000, 16500, 18000, 20000, 22000], 1, 1],
            'Healing': [1800, [20000, 22000, 24000, 26500, 29000], 1, 2],
            'Rage': [2700, [30000, 33000, 36000, 40000, 44000], 1, 3],
            'Jump': [2700, [30000, 38000], 1, 4]
        },
        'dark': {
            'Minion': [45, [6, 7, 8, 9, 10], 2, 1],
            'Hog Rider': [300, [30, 35, 40, 45, 50], 6, 2],
            'Valkyrie': [900, [100, 120, 140, 160], 8, 3],
            'Golem': [2700, [450, 500, 550, 600], 30, 4]
        }
    };


    var currentSpace = {
        'units': 0,
        'dark': 0
    };


    var setQuantityAndSpace = function(maxSpace, totalSpace, type) {
        var spaceDiff = maxSpace - totalSpace;
        if (spaceDiff < 0) {
            spaceDiff = '<span class="limit-exceeded">' + spaceDiff + '</span>';
        }
        ids.get(type + '-quantity').innerHTML = '(' + spaceDiff + ')';

        var space = totalSpace;
        if (totalSpace > maxSpace) {
            space = '<span class="limit-exceeded">' + totalSpace + '</span>';
        }
        space = space + ' / ' + maxSpace;
        ids.get(type + '-space').innerHTML = space;
    };


    var suitableBarracksSort = function(a, b) {
        // least time first
        if (a.time < b.time) {
            return -1;
        }
        if (a.time > b.time) {
            return 1;
        }

        // least space first
        if (a.space < b.space) {
            return -1;
        }
        if (a.space > b.space) {
            return 1;
        }

        // least max space first
        if (a.maxSpace < b.maxSpace) {
            return -1;
        }
        if (a.maxSpace > b.maxSpace) {
            return 1;
        }

        return 0;
    };


    var getSuitableBarrack = function(barracks, requiredLevel, requiredSpace) {
        var suitable = barracks.filter(function(barrack) {
            return barrack.level >= requiredLevel && (barrack.space + requiredSpace) <= barrack.maxSpace;
        });

        if (!suitable.length) {
            return null;
        }

        if (suitable.length > 1) {
            suitable.sort(suitableBarracksSort);
        }

        return suitable[0];
    };


    var unitsDistributionSort = function(a, b) {
        if (a.time < b.time) {
            return 1;
        }
        if (a.time > b.time) {
            return -1;
        }

        if (a.quantity < b.quantity) {
            return 1;
        }
        if (a.quantity > b.quantity) {
            return -1;
        }

        if (a.level < b.level) {
            return 1;
        }
        if (a.level > b.level) {
            return -1;
        }

        return 0;
    };


    var fillBarracks = function(barracksQueue, unitsDistribution, avgTime) {
        var stopDistribution = false;

        var udIndex;
        var udLength;
        for (udIndex = 0, udLength = unitsDistribution.length; udIndex < udLength; udIndex++) {
            var kit = unitsDistribution[udIndex];
            var i;
            var barrack = null;
            for (i = 0; i < kit.quantity; i++) {
                var isGetBarrack = true;
                if (barrack) {
                    var newTime = barrack.time + kit.time;
                    var newSpace = barrack.space + kit.space;
                    if (newTime < (avgTime / 3) ||
                        newSpace < (barrack.maxSpace / 4) ||
                        (kit.space === 1 && newTime < avgTime && newSpace < barrack.maxSpace)) {
                        isGetBarrack = false;
                    }
                }

                if (isGetBarrack) {
                    barrack = getSuitableBarrack(barracksQueue, kit.level, kit.space);
                }

                if (barrack === null) {
                    stopDistribution = true;
                    break;
                }

                if (!barrack.units[kit.name]) {
                    barrack.units[kit.name] = 0;
                }

                barrack.units[kit.name]++;
                barrack.time += kit.time;
                barrack.space += kit.space;
            }
        }

        return !stopDistribution;
    };


    var calculateItems = function(type, params) {
        ids.get(type).style.display = (params.levelValue === 0 ? 'none' : '');

        var i;
        for (
            i = params.capLevel;
            i >= 1;
            i--
        ) {
            ids.get(type + '-building-level-' + i).style.display = (i > params.levelValue ? 'none' : '');
        }

        var totalCost = 0;
        var totalSpace = 0;
        var totalTime = 0;
        var distribution = [];
        objectIterate(types[type], function(name, value) {
            if (value[3] > params.levelValue) {
                return;
            }
            var item = ids.get(name);

            var quantity = parseInt(item.value, 10) || 0;
            if (quantity < 0) {
                quantity = 0;
            }
            if (item.value !== '') {
                item.value = quantity;
            }

            var levelId = name + '-level';
            var levelEl = ids.get(levelId);
            var summaryEl = ids.get(name + '-summary');
            var costPerItem = levelEl.value;
            var summaryCost = (costPerItem * quantity);

            summaryEl.innerHTML = (summaryCost ? numberFormat(summaryCost) : 0);

            totalCost += summaryCost;

            totalSpace += (value[2] * quantity);
            totalTime += (value[0] * quantity);
            if (type !== 'spells') {
                var i;
                for (i = 1; i <= allBarracks[type].getMaxCount(); i++) {
                    ids.get('quantity-' + name + '-' + i).innerHTML = '';
                }

                var subtractId = name + '-subtract';
                var subtract = ids.get(subtractId);
                var subtractQuantity = parseInt(subtract.value, 10) || 0;
                if (subtractQuantity < 0) {
                    subtractQuantity = 0;
                }
                if (subtract.value !== '') {
                    subtract.value = subtractQuantity;
                }

                if (quantity > 0) {
                    distribution.push({
                        'name': name,
                        'quantity': quantity - subtractQuantity,
                        'level': value[3],
                        'space': value[2],
                        'time': value[0],
                    });
                }

                savedData.set(subtractId, subtractQuantity);
            }

            savedData.set(name, quantity);
            savedData.set(levelId, levelEl.selectedIndex);
        });

        if (type === 'units' || type === 'dark') {
            distribution.sort(unitsDistributionSort);

            var barracksQueue = [];
            allBarracks[type].getAllNormalized().forEach(function(barrackData, barrackIndex) {
                var header;
                if (parseInt(barrackData.level, 10) === 0) {
                    header = '';
                } else {
                    header = barrackData.level +
                             ' lvl <span class="' +
                             type +
                             '-quantity" title="Maximum Unit Queue Length">(' +
                             barrackData.queueLength +
                             ')</span>';
                }
                ids.get(type + '-barrack-header-' + (barrackIndex + 1)).innerHTML = header;

                barracksQueue.push({
                    'num': barrackIndex + 1,
                    'time': 0,
                    'space': 0,
                    'maxSpace': barrackData.queueLength,
                    'units': {},
                    'level': barrackData.level
                });
            });

            var maxUnitTime = Math.max.apply(null, distribution.map(function(distributionItem) {
                return distributionItem.time;
            }));

            var avgTime = Math.max(Math.ceil(totalTime / allBarracks[type].getActiveCount()), maxUnitTime);
            var fillSuccess = fillBarracks(barracksQueue, distribution, avgTime);

            if (fillSuccess) {
                ids.get(type + '-barracks-exceeded').style.display = 'none';
                var maxTime = 0;
                var maxNum = 1;
                barracksQueue.forEach(function(v) {
                    objectIterate(v.units, function(unitName, unitQuantity) {
                        if (unitQuantity > 0) {
                            ids.get('quantity-' + unitName + '-' + v.num).innerHTML = '×' + unitQuantity;
                        }
                    });
                    if (v.time > maxTime) {
                        maxTime = v.time;
                        maxNum = v.num;
                    }
                    ids.get(type + '-time-barrack-' + v.num).innerHTML = (v.time ? getFormattedTime(v.time) : '');
                });
                var maxBarrack = ids.get(type + '-time-barrack-' + maxNum);
                maxBarrack.innerHTML = '<span class="result">' + maxBarrack.innerHTML + '</span>';
            } else {
                ids.get(type + '-barracks-exceeded').style.display = '';
                barracksQueue.forEach(function(v) {
                    ids.get(type + '-time-barrack-' + v.num).innerHTML = '';
                });
            }

            currentSpace[type] += totalSpace;
        }

        ids.get(type + '-cost').innerHTML = numberFormat(totalCost);

        if (type === 'spells') {
            setQuantityAndSpace(params.space, totalSpace, type);
            ids.get(type + '-time').innerHTML = getFormattedTime(totalTime, true);
        }
    };


    var calculateDelayedTimeoutLong = null;
    var calculateDelayedTimeoutShort = null;
    var calculateDelayed = function(type) {
        var calculateFunc = calculate.bind(null, type);
        if (!calculateDelayedTimeoutLong) {
            calculateDelayedTimeoutLong = setTimeout(calculateFunc, 500);
        }
        clearTimeout(calculateDelayedTimeoutShort);
        calculateDelayedTimeoutShort = setTimeout(calculateFunc, 150);
    };


    var calculate = function(type) {
        clearTimeout(calculateDelayedTimeoutLong);
        clearTimeout(calculateDelayedTimeoutShort);
        calculateDelayedTimeoutLong = null;

        if (type === 'all' || type !== 'spells') {

            var armyCampsSpace = parseInt(armyCamps.value, 10);
            if (isNaN(armyCampsSpace) || armyCampsSpace < 0) {
                armyCampsSpace = 0;
            }
            var armyCampsMaxSpace = armyCamps.getAttribute('max');
            if (armyCampsSpace > armyCampsMaxSpace) {
                armyCampsSpace = armyCampsMaxSpace;
            }
            armyCamps.value = armyCampsSpace;

            if (type === 'all' || type === 'units') {
                currentSpace.units = 0;
                calculateItems('units', {
                    'levelValue': allBarracks.units.getMaxLevel(),
                    'space': armyCampsSpace,
                    'capLevel': allBarracks.units.getCapLevel()
                });
            }

            if (type === 'all' || type === 'dark') {
                currentSpace.dark = 0;
                calculateItems('dark', {
                    'levelValue': allBarracks.dark.getMaxLevel(),
                    'space': armyCampsSpace,
                    'capLevel': allBarracks.dark.getCapLevel()
                });
            }

            var togetherSpace = currentSpace.units + currentSpace.dark;
            setQuantityAndSpace(armyCamps.value, togetherSpace, 'units');
            setQuantityAndSpace(armyCamps.value, togetherSpace, 'dark');

            savedData.set('armyCamps', armyCamps.value);

            allBarracks.units.updateSavedData();
            allBarracks.dark.updateSavedData();
        }

        if (type === 'all' || type === 'spells') {
            calculateItems('spells', {
                'levelValue': parseInt(spellFactoryLevel.value, 10),
                'space': spellFactoryLevel.value,
                'capLevel': spellFactoryLevel.options[spellFactoryLevel.options.length - 1].value
            });

            savedData.set('spellFactoryLevel', spellFactoryLevel.selectedIndex);
        }

        savedDataStorage.save(savedData.getAll());
    };


    var setDefaults = function() {
        allBarracks.units.setDefaults();
        allBarracks.dark.setDefaults();
        armyCamps.value = savedData.get('armyCamps', armyCamps.value);
        spellFactoryLevel.options[savedData.get('spellFactoryLevel', spellFactoryLevel.selectedIndex)].selected = true;

        var setItems = function(type) {
            objectIterate(types[type], function(name) {
                var levelId = name + '-level';
                var levelEl = ids.get(levelId);
                levelEl.options[savedData.get(levelId, levelEl.selectedIndex)].selected = true;

                var valueEl = ids.get(name);
                if (type === 'spells') {
                    valueEl.options[savedData.get(name, valueEl.selectedIndex)].selected = true;
                } else {
                    valueEl.value = savedData.get(name) || 0;

                    var subtractId = name + '-subtract';
                    ids.get(subtractId).value = savedData.get(subtractId) || 0;
                }
            });
        };

        setItems('units');
        setItems('spells');
        setItems('dark');
    };


    objectIterate(allBarracks, function(k, v) {
        v.getElements().forEach(function(el) {
            el.addEventListener('change', calculate.bind(null, k), false);
        });
    });
    armyCamps.addEventListener('input', calculate.bind(null, 'all'), false);
    spellFactoryLevel.addEventListener('change', calculate.bind(null, 'spells'), false);


    var spinnerAction = function(eventElement) {
        var targetElement = ids.get(eventElement.getAttribute('data-target'));
        var multiplier = parseInt(targetElement.getAttribute('data-multiplier'), 10) || 1;
        var current = parseInt(targetElement.value, 10);
        if (eventElement.getAttribute('data-spinner-type') === 'plus') {
            if (isNaN(current)) {
                targetElement.value = multiplier;
            } else {
                targetElement.value = current + multiplier;
            }
        } else {
            if (isNaN(current) || current < 2) {
                targetElement.value = 0;
            } else {
                targetElement.value = current - multiplier;
            }
        }
        calculateDelayed(targetElement.getAttribute('data-object-type'));
    };


    var setSpinner = function(type, el) {
        var span = document.createElement('span');
        span.className = 'like-button like-button_after';
        span.innerHTML = (type === 'plus' ? '+' : '−');
        span.setAttribute('data-spinner-type', type);
        span.setAttribute('data-target', el.getAttribute('id'));

        var interval = null;
        var timeout = null;
        var hold = function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.target.setAttribute('data-clicked', '1');
            timeout = window.setTimeout(function(eventElement) {
                eventElement.removeAttribute('data-clicked');
                interval = window.setInterval(
                    spinnerAction.bind(null, eventElement),
                    100
                );
            }.bind(null, e.target), 500);
        };
        var release = function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (e.target.getAttribute('data-clicked') === '1') {
                spinnerAction(e.target);
            }
            clearTimeout(timeout);
            clearInterval(interval);
        };
        span.addEventListener('touchstart', hold);
        span.addEventListener('touchend', release);
        span.addEventListener('mousedown', hold);
        span.addEventListener('mouseup', release);

        el.parentNode.appendChild(span);
    };

    var rowTemplate = templates.item_row;

    var createRows = function(type, tabIndexMultiplier) {
        var createLevelOption = function(value, index) {
            return {'value': value, 'text': (index + 1)};
        };

        var spellsValuesContent = [];
        if (type === 'spells') {
            var i;
            for (i = 0; i < 5; i++) {
                spellsValuesContent.push({'value': i, 'text': i});
            }
        }

        var itemsBody = ids.get(type + '-body');
        objectIterate(types[type], function(name, value) {
            var convertedName = convertToTitle(name);
            var templateVars = {
                'id': name,
                'title': convertedName,
                'titleLink': getWikiaLink(convertedName, (type === 'spells')),
                'levelId': name + '-level',
                'levelContent': value[1].map(createLevelOption),
                'summaryId': name + '-summary',
                'rowId': type + '-building-level-' + value[3],
                'tabIndexLevel': tabIndexMultiplier + value[3],
                'tabIndexValue': tabIndexMultiplier + 1000 + value[3],
                'objectType': type
            };
            if (type === 'spells') {
                templateVars.spells = {
                    'options': spellsValuesContent
                };
            }

            if (type === 'units' || type === 'dark') {
                var i;
                var barracksTimes = [];
                for (i = 1; i <= allBarracks[type].getMaxCount(); i++) {
                    barracksTimes.push({
                        'barrackQuantityId': 'quantity-' + name + '-' + i
                    });
                }
                templateVars.barracksTimes = barracksTimes;

                templateVars.subtractId = name + '-subtract';
                templateVars.tabIndexSubtract = tabIndexMultiplier + 4000 + value[3];
            }

            var rowHTML = rowTemplate.render(templateVars);

            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = '<table>' + rowHTML + '</table>';

            var itemRow = tempDiv.querySelector('tr');
            itemsBody.appendChild(itemRow);

            ids.get(templateVars.levelId).addEventListener('change', calculate.bind(null, type), false);
            ids.get(templateVars.id).addEventListener(
                (type === 'spells' ? 'change' : 'input'),
                calculate.bind(null, type),
                false
            );

            if (type === 'units' || type === 'dark') {
                ids.get(templateVars.subtractId).addEventListener('input', calculate.bind(null, type), false);
            }
        });
    };

    createRows('units', 100);
    createRows('dark', 200);
    createRows('spells', 300);

    var selectAll = function(e) {
        if (e.target.tagName.toLowerCase() === 'input') {
            setTimeout(function(el) {
                el.setSelectionRange(0, 9999);
            }.bind(null, e.target), 10);
        }
    };
    toArray(document.getElementsByClassName('js-number')).forEach(function(el) {
        el.addEventListener('focus', selectAll, false);
        setSpinner('plus', el);
        setSpinner('minus', el);
    });

    var resetColumn = function(e) {
        e.preventDefault();
        e.stopPropagation();
        var resetType = e.target.getAttribute('data-reset-type');
        objectIterate(types[resetType], function(k) {
            var key = k;
            var scope = e.target.getAttribute('data-scope');
            if (scope !== 'quantity') {
                key += '-' + scope;
            }
            ids.get(key).value = '0';
        });
        calculate(resetType);
    };

    toArray(document.getElementsByClassName('js-reset')).forEach(function(el) {
        el.addEventListener('click', resetColumn, false);
        el.addEventListener('touchend', resetColumn, false);
    });

    setDefaults();
    calculate('all');

    if (window.device && window.device.cordova) {
        toArray(document.getElementsByClassName('js-link')).forEach(function(el) {
            var href = el.getAttribute('href');
            el.removeAttribute('target');
            el.setAttribute('href', 'javascript:void(0)');
            el.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                app.open_browser(href);
            });
        });
    }


    var savedCalculationsStorage = new DataStorage('savedCalculations', []);
    var savedCalculations = new MultiDict(savedCalculationsStorage.load());

    var savedListItemTemplate = templates.saved_list_item;
    var savedListCreateItems = function() {
        var content = [];
        savedCalculations.forEach(function(data, index) {
            var templateVars = {
                'index': index,
                'tabIndexLoad': index + 3000 + 1,
                'tabIndexDelete': index + 3000 + 2
            };

            var unitsItems = [];
            var totalCost = 0;
            var totalCapacity = 0;
            var barracksLevels = data.get('barracksLevels', [10, 10, 10, 10]);
            objectIterate(types.units, function(name, unitValue) {
                var quantity = parseInt(data.get(name), 10) || 0;
                var barracksLevel = Math.max.apply(null, barracksLevels.map(function(barrackIndex, arrayIndex) {
                    return (arrayIndex === 0 ? barrackIndex + 1 : barrackIndex);
                }));
                if (quantity > 0 && unitValue[3] <= barracksLevel) {
                    unitsItems.push({
                        'name': convertToTitle(name),
                        'level': (new Array(data.get(name + '-level') + 2)).join('*'),
                        'quantity': quantity
                    });
                    totalCost += unitValue[1][data.get(name + '-level')] * quantity;
                    totalCapacity += unitValue[2] * quantity;
                }
            });
            if (unitsItems.length) {
                templateVars.hasUnits = {
                    'units': unitsItems,
                    'totalCost': numberFormat(totalCost)
                };
            }

            var darkBarracksLevels = data.get('darkBarracksLevels', [4, 4]);
            var darkBarracksLevel = Math.max.apply(null, darkBarracksLevels);
            if (darkBarracksLevel > 0) {
                var darkItems = [];
                var darkCost = 0;
                objectIterate(types.dark, function(name, unitValue) {
                    var quantity = parseInt(data.get(name), 10) || 0;
                    if (quantity > 0 && unitValue[3] <= darkBarracksLevel) {
                        darkItems.push({
                            'name': convertToTitle(name),
                            'level': (new Array(data.get(name + '-level') + 2)).join('*'),
                            'quantity': quantity
                        });
                        darkCost += unitValue[1][data.get(name + '-level')] * quantity;
                        totalCapacity += unitValue[2] * quantity;
                    }
                });
                if (darkItems.length) {
                    templateVars.hasDark = {
                        'dark': darkItems,
                        'darkCost': numberFormat(darkCost)
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
                objectIterate(types.spells, function(spellName, spellValue) {
                    var spellQuantity = parseInt(data.get(spellName), 10) || 0;
                    if (spellQuantity > 0 && spellValue[3] <= data.get('spellFactoryLevel')) {
                        spellsItems.push({
                            'name': convertToTitle(spellName),
                            'level': (new Array(data.get(spellName + '-level') + 2)).join('*'),
                            'quantity': spellQuantity
                        });
                        spellsCost += spellValue[1][data.get(spellName + '-level')] * spellQuantity;
                        spellsCapacity += spellValue[2] * spellQuantity;
                    }
                });
                if (spellsItems.length) {
                    templateVars.hasSpells = {
                        'spells': spellsItems,
                        'spellsCost': numberFormat(spellsCost),
                        'spellsCapacity': spellsCapacity,
                        'spellsFactoryLevel': data.get('spellFactoryLevel')
                    };
                }
            }

            content.push(savedListItemTemplate.render(templateVars));
        });

        var savedListContent = ids.get('saved-list-content');
        savedListContent.innerHTML = content.join('');

        var loadSaved = function(e) {
            e.preventDefault();
            e.stopPropagation();
            savedData = new Dict(objectCopy(savedCalculations.retrieve(e.target.getAttribute('data-num')).getAll()));
            setDefaults();
            calculate('all');
            savedListCreateItems();
        };

        toArray(savedListContent.getElementsByClassName('js-saved-load')).forEach(function(el) {
            el.addEventListener('click', loadSaved, false);
            el.addEventListener('touchend', loadSaved, false);
        });

        var deleteSaved = function(e) {
            e.preventDefault();
            e.stopPropagation();
            savedCalculations.remove(e.target.getAttribute('data-num'));
            savedCalculationsStorage.save(savedCalculations.getAll());
            savedListCreateItems();
        };

        toArray(savedListContent.getElementsByClassName('js-saved-delete')).forEach(function(el) {
            el.addEventListener('click', deleteSaved, false);
            el.addEventListener('touchend', deleteSaved, false);
        });
    };

    var save = function(e) {
        e.preventDefault();
        e.stopPropagation();
        var dataToSave = objectCopy(savedData.getAll());
        objectIterate(dataToSave, function(k) {
            if (k.indexOf('subtract') !== -1) {
                delete dataToSave[k];
            }
        });
        savedCalculations.insert(dataToSave);
        savedCalculationsStorage.save(savedCalculations.getAll());
        savedListCreateItems();
    };

    ids.get('save').addEventListener('click', save, false);
    ids.get('save').addEventListener('touchend', save, false);

    savedListCreateItems();

}(window, document));
