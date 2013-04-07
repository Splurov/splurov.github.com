(function(window, document) {

    'use strict';


    if (!Function.prototype.bind) {
        Function.prototype.bind = function(context) {
            var self = this;
            var args = Array.prototype.slice.call(arguments, 1);
            return function() {
                return self.apply(context, args.concat(Array.prototype.slice.call(arguments)));
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
        var elements = {};
        this.get = function(id) {
            if (!elements.hasOwnProperty(id)) {
                elements[id] = document.getElementById(id);
            }
            return elements[id];
        };
    };


    var ids = new IdsCacher();


    var savedDataStorage = new DataStorage('savedData', {});
    var savedData = new Dict(savedDataStorage.load());

    var BarracksContainer = function(maxCount, selectName, saveName) {
        this.barracks = [];

        var i;
        for (i = 1; i <= maxCount; i++) {
            var barrack = ids.get(selectName + '-' + i);
            this.barracks.push(barrack);
        }

        this.setDefaults = function() {
            var saved = savedData.get(saveName);
            if (saved) {
                this.barracks.forEach(function(el, i) {
                    el.options[saved[i]].selected = true;
                });
            }
        };

        this.updateSavedData = function() {
            savedData.set(saveName, this.barracks.map(function(el) {
                return el.selectedIndex;
            }));
        };

        this.getMaxLevel = function() {
            return Math.max.apply(null, this.barracks.map(function(el) {
                return parseInt(el.value, 10);
            }));
        };

        this.getAll = function() {
            return this.barracks;
        };

        this.getLevels = function() {
            return this.barracks.map(function(el) {
                return el.value;
            });
        };

        this.getMaxCount = function() {
            return maxCount;
        };

    };

    var allBarracks = {
        'units': new BarracksContainer(4, 'barracks-levels', 'barracksLevels'),
        'dark': new BarracksContainer(2, 'dark-barracks-levels', 'darkBarracksLevels')
    };

    var armyCamps = ids.get('army-camps');
    var spellFactoryLevel = ids.get('spell-factory-level');


    var units = {
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
    };
    var unitsTable = ids.get('units');

    var spells = {
        'Lightning': [3600, [15000, 16500, 18000, 20000, 22000], 1, 1],
        'Healing': [5400, [20000, 22000, 24000, 26500, 29000], 1, 2],
        'Rage': [7200, [30000, 33000, 36000, 40000, 44000], 1, 3],
        'Jump': [5400, [30000, 38000], 1, 4]
    };
    var spellsTable = ids.get('spells');

    var barracksQueueLength = {
        'units': [0, 20, 25, 30, 35, 40, 45, 50, 55, 60, 75],
        'dark': [0, 40, 50, 60]
    };

    var dark = {
        'Minion': [45, [6, 7, 8, 9, 10], 2, 1],
        'Hog Rider': [300, [30, 35, 40, 45, 50], 6, 2],
        'Valkyrie': [900, [100, 120, 140, 160], 8, 3]
    };

    var darkTable = ids.get('dark');

    var currentUnitsSpace = 0;


    var setQuantityAndSpace = function(maxSpace, totalSpace, type) {
        var spaceDiff = maxSpace - totalSpace;
        if (spaceDiff < 0) {
            spaceDiff = '<span class="limit-exceeded">' + spaceDiff + '</span>';
        }
        ids.get(type + '-quantity').innerHTML = '(' + spaceDiff + ')';

        if (totalSpace > maxSpace) {
            totalSpace = '<span class="limit-exceeded">' + totalSpace + '</span>';
        }
        totalSpace = totalSpace + ' / ' + maxSpace;
        ids.get(type + '-space').innerHTML = totalSpace;
    };


    var calculateItems = function(items, type, params) {
        params.table.style.display = (params.levelValue === 0 ? 'none' : '');

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
        objectIterate(items, function(name, value) {
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
            var costEl = ids.get(name + '-cost');
            var summaryEl = ids.get(name + '-summary');
            var costPerItem = levelEl.value;
            var summaryCost = (costPerItem * quantity);

            costEl.innerHTML = numberFormat(costPerItem);
            summaryEl.innerHTML = (summaryCost ? numberFormat(summaryCost) : 0);

            totalCost += summaryCost;

            totalSpace += (value[2] * quantity);
            if (type === 'spells') {
                totalTime += (value[0] * quantity);
            } else {
                var i;
                for (i = 1; i <= allBarracks[type].getMaxCount(); i++) {
                    ids.get('quantity-' + name + '-' + i).innerHTML = '';
                    ids.get('time-' + name + '-' + i).innerHTML = '';
                }

                if (quantity > 0) {
                    distribution.push({
                        'name': name,
                        'quantity': quantity,
                        'time': value[0],
                        'level': value[3],
                        'space': value[2]
                    });

                }
            }

            savedData.set(name, quantity);
            savedData.set(levelId, levelEl.selectedIndex);
        });

        if (type === 'units' || type === 'dark') {
            var barracksLevels = allBarracks[type].getLevels();
            barracksLevels.forEach(function(barrackLevel, barrackIndex) {
                var header;
                if (parseInt(barrackLevel, 10) === 0) {
                    header = '';
                } else {
                    header = barrackLevel +
                             ' lvl <span class="' +
                             type +
                             '-quantity" title="Maximum Unit Queue Length">(' +
                             barracksQueueLength[type][barrackLevel] +
                             ')</span>';
                }
                ids.get(type + '-barrack-header-' + (barrackIndex + 1)).innerHTML = header;
            });

            var queue = {};
            allBarracks[type].getAll().forEach(function(barrack) {
                queue[barrack.getAttribute('id')] = {
                    'time': 0,
                    'space': 0,
                    'maxSpace': barracksQueueLength[type][barrack.value],
                    'units': {},
                    'level': barrack.value
                };
            });

            distribution.sort(function(a, b) {
                if (a.time < b.time) {
                    return 1;
                }
                if (a.time > b.time) {
                    return -1;
                }
                if (a.quantity > b.quantity) {
                    return -1;
                }
                if (a.quantity < b.quantity) {
                    return 1;
                }
                return 0;
            });

            var getSuitableQueueItem = function(queue, requiredLevel, requiredSpace) {
                var item = null;
                var i;
                var suitable = [];
                for (i in queue) {
                    var current = queue[i];
                    if (current.level < requiredLevel) {
                        continue;
                    }
                    if ((current.space + requiredSpace) > current.maxSpace) {
                        continue;
                    }
                    suitable.push(current);
                }

                if (suitable.length > 1) {
                    suitable.sort(function(a, b) {
                        if (a.time < b.time) {
                            return -1;
                        }
                        if (a.time > b.time) {
                            return 1;
                        }
                        if (a.space < b.space) {
                            return -1;
                        }
                        if (a.space > b.space) {
                            return 1;
                        }
                        return 0;
                    });
                    item = suitable[0];
                } else if (suitable.length) {
                    item = suitable[0];
                }

                return item;
            };

            var j;
            var distributionLength;
            var stopDistribution = false;
            for (j = 0, distributionLength = distribution.length; j < distributionLength; j++) {
                var kit = distribution[j];
                var k;
                for (k = 0; k < kit.quantity; k++) {
                    var item = getSuitableQueueItem(queue, kit.level, kit.space);

                    if (item === null) {
                        stopDistribution = true;
                        break;
                    }

                    if (!item.units[kit.name]) {
                        item.units[kit.name] = {
                            'time': 0,
                            'quantity': 0
                        };
                    }

                    item.units[kit.name].time += kit.time;
                    item.units[kit.name].quantity += 1;
                    item.time += kit.time;
                    item.space += kit.space;
                }
            }

            if (stopDistribution) {
                ids.get(type + '-barracks-exceeded').style.display = '';
                objectIterate(queue, function(k) {
                    var barrackNum = k.slice(-1);
                    ids.get(type + '-time-barrack-' + barrackNum).innerHTML = '';
                });
            } else {
                ids.get(type + '-barracks-exceeded').style.display = 'none';
                var maxTime = 0;
                var maxNum = 1;
                objectIterate(queue, function(k, v) {
                    var barrackNum = k.slice(-1);
                    objectIterate(v.units, function(unitName, unitData) {
                        if (unitData.time > 0) {
                            ids.get('time-' + unitName + '-' + barrackNum).innerHTML = getFormattedTime(unitData.time);
                            ids.get('quantity-' + unitName + '-' + barrackNum).innerHTML = '×' + unitData.quantity;
                        }
                    });
                    if (v.time > maxTime) {
                        maxTime = v.time;
                        maxNum = barrackNum;
                    }
                    ids.get(type + '-time-barrack-' + barrackNum).innerHTML = (v.time ? getFormattedTime(v.time) : '');
                });
                var maxBarrack = ids.get(type + '-time-barrack-' + maxNum);
                maxBarrack.innerHTML = '<span class="result">' + maxBarrack.innerHTML + '</span>';
            }
        }

        ids.get(type + '-cost').innerHTML = numberFormat(totalCost);

        if (type === 'spells') {
            setQuantityAndSpace(params.space, totalSpace, type);
        } else {
            currentUnitsSpace += totalSpace;
        }

        if (type === 'spells') {
            ids.get(type + '-time').innerHTML = getFormattedTime(totalTime, (type === 'spells'));
        }
    };


    var calculate = function() {
        currentUnitsSpace = 0;
        var armyCampsSpace = parseInt(armyCamps.value, 10);
        if (isNaN(armyCampsSpace) || armyCampsSpace < 0) {
            armyCampsSpace = 0;
        }
        armyCamps.value = armyCampsSpace;
        calculateItems(units, 'units', {
            'table': unitsTable,
            'levelValue': allBarracks['units'].getMaxLevel(),
            'space': armyCampsSpace,
            'capLevel': 10
        });
        calculateItems(spells, 'spells', {
            'table': spellsTable,
            'levelValue': parseInt(spellFactoryLevel.value, 10),
            'space': spellFactoryLevel.value,
            'capLevel': 4
        });
        calculateItems(dark, 'dark', {
            'table': darkTable,
            'levelValue': allBarracks['dark'].getMaxLevel(),
            'space': armyCampsSpace,
            'capLevel': 3
        });

        setQuantityAndSpace(armyCamps.value, currentUnitsSpace, 'units');
        setQuantityAndSpace(armyCamps.value, currentUnitsSpace, 'dark');

        allBarracks.units.updateSavedData();
        allBarracks.dark.updateSavedData();

        savedData.set('armyCamps', armyCamps.value);
        savedData.set('spellFactoryLevel', spellFactoryLevel.selectedIndex);

        savedDataStorage.save(savedData.getAll());
    };


    var setDefaults = function() {
        allBarracks.units.setDefaults();
        allBarracks.dark.setDefaults();
        armyCamps.value = savedData.get('armyCamps', armyCamps.value);
        spellFactoryLevel.options[savedData.get('spellFactoryLevel', spellFactoryLevel.selectedIndex)].selected = true;

        var setItems = function(items, type) {
            objectIterate(items, function(name) {
                var levelId = name + '-level';
                var levelEl = ids.get(levelId);
                levelEl.options[savedData.get(levelId, levelEl.selectedIndex)].selected = true;

                var valueEl = ids.get(name);
                if (type === 'spells') {
                    valueEl.options[savedData.get(name, valueEl.selectedIndex)].selected = true;
                } else {
                    valueEl.value = savedData.get(name) || 0;
                }
            });
        };

        setItems(units, 'units');
        setItems(spells, 'spells');
        setItems(dark, 'dark');
    };


    objectIterate(allBarracks, function(k, v) {
        v.getAll().forEach(function(el) {
            el.addEventListener('change', calculate, false);
        });
    });
    armyCamps.addEventListener('input', calculate, false);
    spellFactoryLevel.addEventListener('change', calculate, false);


    var setSpinner = function(el) {

        var multiplier = parseInt(el.getAttribute('data-multiplier'), 10) || 1;

        var plus = function() {
            var current = parseInt(el.value, 10);
            if (isNaN(current)) {
                el.value = multiplier;
            } else {
                el.value = current + multiplier;
            }
            calculate();
        };

        var minus = function() {
            var current = parseInt(el.value, 10);
            if (isNaN(current) || current < 2) {
                el.value = 0;
            } else {
                el.value = current - multiplier;
            }
            calculate();
        };

        var create = function(type) {
            var span = document.createElement('span');
            span.className = 'like-button like-button_after';
            span.innerHTML = (type === 'plus' ? '+' : '−');

            span.addEventListener('click', (type === 'plus' ? plus : minus), false);

            var interval = null;
            var timeout = null;
            span.addEventListener('mousedown', function() {
                timeout = window.setTimeout(function() {
                    interval = window.setInterval((type === 'plus' ? plus : minus), 100);
                }, 500);
            });
            span.addEventListener('mouseup', function() {
                clearTimeout(timeout);
                clearInterval(interval);
            });
            el.parentNode.appendChild(span);
        };

        create('plus');
        create('minus');

    };

    var rowTemplate = Hogan.compile(document.getElementById('hogan-item-row-template').innerHTML);

    var createRows = function(items, type) {
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
        objectIterate(items, function(name, value) {
            var templateVars = {
                'id': name,
                'title': convertToTitle(name),
                'levelId': name + '-level',
                'levelContent': value[1].map(createLevelOption),
                'costId': name + '-cost',
                'summaryId': name + '-summary',
                'rowId': type + '-building-level-' + value[3]
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
                        'barrackQuantityId': 'quantity-' + name + '-' + i,
                        'barrackTimeId': 'time-' + name + '-' + i
                    });
                }
                templateVars.barracksTimes = barracksTimes;
            }

            var rowHTML = rowTemplate.render(templateVars);

            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = '<table>' + rowHTML + '</table>';

            var itemRow = tempDiv.querySelector('tr');
            itemsBody.appendChild(itemRow);

            ids.get(templateVars.levelId).addEventListener('change', calculate, false);
            ids.get(templateVars.id).addEventListener((type === 'spells' ? 'change' : 'input'), calculate, false);
        });
    };

    createRows(units, 'units');
    createRows(dark, 'dark');
    createRows(spells, 'spells');

    var selectAll = function(e) {
        if (e.target.tagName.toLowerCase() === 'input') {
            setTimeout(function(el) {
                el.setSelectionRange(0, 9999);
            }.bind(null, e.target), 10);
        }
    };
    Array.prototype.slice.call(document.getElementsByClassName('js-number')).forEach(function(el) {
        el.addEventListener('focus', selectAll, false);
        setSpinner(el);
    });

    setDefaults();
    calculate();


    var savedCalculationsStorage = new DataStorage('savedCalculations', []);
    var savedCalculations = new MultiDict(savedCalculationsStorage.load());

    var savedListItemTemplate = Hogan.compile(document.getElementById('hogan-saved-list-item-template').innerHTML);
    var savedListCreateItems = function() {
        var content = [];
        savedCalculations.forEach(function(data, index) {
            var templateVars = {
                'index': index
            };

            var unitsItems = [];
            var totalCost = 0;
            var totalCapacity = 0;
            var barracksLevels = data.get('barracksLevels', [10, 10, 10, 10]);
            objectIterate(units, function(name, unitValue) {
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
                    'totalCost': numberFormat(totalCost),
                };
            }

            var darkBarracksLevels = data.get('darkBarracksLevels', [4, 4]);
            var darkBarracksLevel = Math.max.apply(null, darkBarracksLevels);
            if (darkBarracksLevel > 0) {
                var darkItems = [];
                var darkCost = 0;
                objectIterate(dark, function(name, unitValue) {
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
                objectIterate(spells, function(spellName, spellValue) {
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

        Array.prototype.slice.call(savedListContent.getElementsByClassName('js-saved-load')).forEach(function(el) {
            el.addEventListener('click', function() {
                savedData = new Dict(objectCopy(savedCalculations.retrieve(el.getAttribute('data-num')).getAll()));
                setDefaults();
                calculate();
                savedListCreateItems();
            }, false);
        });

        Array.prototype.slice.call(savedListContent.getElementsByClassName('js-saved-delete')).forEach(function(el) {
            el.addEventListener('click', function() {
                savedCalculations.remove(el.getAttribute('data-num'));
                savedCalculationsStorage.save(savedCalculations.getAll());
                savedListCreateItems();
            }, false);
        });
    };

    ids.get('save').addEventListener('click', function() {
        savedCalculations.insert(objectCopy(savedData.getAll()));
        savedCalculationsStorage.save(savedCalculations.getAll());
        savedListCreateItems();
    }, false);

    savedListCreateItems();

}(window, document));
