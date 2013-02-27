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
        if (time > 3599) {
            formattedTime += Math.floor(time / 3600) + 'h ';
            time = time % 3600;
        }
        if (time > 59) {
            var minutes = Math.floor(time / 60);
            time = time % 60;
            if (hideSeconds && time > 0) {
                minutes++;
            }
            formattedTime += minutes + 'm ';
        } else {
            formattedTime += '0m ';
        }
        if (formattedTime === '' || !hideSeconds) {
            formattedTime += time + 's';
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

    var BarracksContainer = function() {
        this.barracks = [];

        var maxCount = 4;
        var i;
        for (i = 1; i <= maxCount; i++) {
            var barrack = ids.get('barracks-levels-' + i);
            this.barracks.push(barrack);
        }

        this.setDefaults = function() {
            var saved = savedData.get('barracksLevels');
            if (saved) {
                this.barracks.forEach(function(el, i) {
                    el.options[saved[i]].selected = true;
                });
            }
        };

        this.updateSavedData = function() {
            savedData.set('barracksLevels', this.barracks.map(function(el) {
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

        this.getObjectForLevel = function(level) {
            var result = {};
            this.barracks.forEach(function(el) {
                if (el.value >= level) {
                    result[el.getAttribute('id')] = el;
                }
            });

            return result;
        };

        this.getLevels = function() {
            return this.barracks.map(function(el) {
                return el.value;
            });
        };

    };

    var allBarracks = new BarracksContainer();

    var armyCamps = ids.get('army-camps');
    var spellFactoryLevel = ids.get('spell-factory-level');


    var units = {
        'Barbarian': [20, [25, 40, 60, 80, 100, 150], 1, 1],
        'Archer': [25, [50, 80, 120, 160, 200, 300], 1, 2],
        'Goblin': [30, [25, 40, 60, 80, 100], 1, 3],
        'Giant': [120, [500, 1000, 1500, 2000, 2500, 3000], 5, 4],
        'Wall_Breaker': [120, [1000, 1500, 2000, 2500, 3000], 1, 5],
        'Balloon': [600, [2000, 2500, 3000, 3500, 4000, 4500], 5, 6],
        'Wizard': [600, [1500, 2000, 2500, 3000, 3500], 4, 7],
        'Healer': [1200, [7000, 10000, 13000], 20, 8],
        'Dragon': [1800, [25000, 32500, 40000], 20, 9],
        'P-E-K-K-A-': [3600, [35000, 42500, 50000], 25, 10]
    };
    var unitsTable = ids.get('units');

    var spells = {
        'Lightning': [3600, [15000, 16500, 18000, 20000, 22000], 1, 1],
        'Healing': [5400, [20000, 22000, 24000, 26500, 29000], 1, 2],
        'Rage': [7200, [30000, 33000, 36000, 40000, 44000], 1, 3],
        'Jump': [5400, [30000, 38000], 1, 4]
    };
    var spellsTable = ids.get('spells');


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
                for (i = 1; i <= 4; i++) {
                    ids.get('quantity-' + name + '-' + i).innerHTML = '';
                    ids.get('time-' + name + '-' + i).innerHTML = '';
                }

                if (quantity > 0) {
                    distribution.push({
                        'name': name,
                        'quantity': quantity,
                        'time': value[0],
                        'level': value[3]
                    });
                }
            }

            savedData.set(name, quantity);
            savedData.set(levelId, levelEl.selectedIndex);
        });

        if (type === 'units') {
            var barracksLevels = allBarracks.getLevels();
            barracksLevels.forEach(function(barrackLevel, barrackIndex) {
                var header;
                if (parseInt(barrackLevel, 10) === 0) {
                    header = '';
                } else {
                    header = barrackLevel + ' lvl';
                }
                ids.get('barrack-header-' + (barrackIndex + 1)).innerHTML = header;
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

            var queue = {};
            allBarracks.getAll().forEach(function(barrack) {
                queue[barrack.getAttribute('id')] = {
                    'time': 0,
                    'units': {}
                };
            });

            var j = 0;
            var iterateStages = function(currentQueue, kit) {
                if (kit.quantity === 0 || j > 100) {
                    return currentQueue;
                }
                var nextStage = 0;
                objectIterate(currentQueue, function(k, v) {
                    if (v.time === 0) {
                        nextStage = 0;
                        return false;
                    }
                    if (nextStage === 0) {
                        nextStage = v.time;
                    } else {
                        nextStage = Math.min(v.time, nextStage);
                    }
                    return true;
                });
                var i;
                var currentStage = 0;
                for (i = 1; i <= kit.quantity; i++) {
                    if (currentStage !== 0 && currentStage >= nextStage) {
                        break;
                    }
                    objectIterate(currentQueue, function(k, v) {
                        if ((v.time === 0 || v.time <= nextStage) && kit.quantity > 0) {
                            v.units[kit.name].time += kit.time;
                            v.units[kit.name].quantity += 1;
                            v.time += kit.time;
                            currentStage += kit.time;
                            kit.quantity -= 1;
                        }
                    });
                }
                return iterateStages(currentQueue, kit);
            };
            distribution.forEach(function(kit) {
                var barracks = allBarracks.getObjectForLevel(kit.level);
                var currentQueue = {};
                objectIterate(queue, function(k, v) {
                    if (barracks[k]) {
                        currentQueue[k] = objectCopy(v);
                        currentQueue[k].units[kit.name] = {
                            'time': 0,
                            'quantity': 0
                        };
                    }
                });
                objectIterate(iterateStages(currentQueue, kit), function(k, v) {
                    queue[k] = objectCopy(v);
                });
            });
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
                ids.get('units-time-barrack-' + barrackNum).innerHTML = (v.time > 0 ? getFormattedTime(v.time) : '');
            });
            var maxBarrack = ids.get('units-time-barrack-' + maxNum);
            maxBarrack.innerHTML = '<span class="result">' + maxBarrack.innerHTML + '</span>';
        }

        ids.get(type + '-cost').innerHTML = numberFormat(totalCost);

        var spaceDiff = params.space - totalSpace;
        if (spaceDiff < 0) {
            spaceDiff = '<span class="limit-exceeded">' + spaceDiff + '</span>';
        }
        ids.get(type + '-quantity').innerHTML = '(' + spaceDiff + ')';

        if (totalSpace > params.space) {
            totalSpace = '<span class="limit-exceeded">' + totalSpace + '</span>';
        }
        totalSpace = totalSpace + ' / ' + params.space;
        ids.get(type + '-space').innerHTML = totalSpace;

        if (type === 'spells') {
            ids.get(type + '-time').innerHTML = getFormattedTime(totalTime, true);
        }
    };


    var calculate = function() {
        calculateItems(units, 'units', {
            'table': unitsTable,
            'levelValue': allBarracks.getMaxLevel(),
            'space': armyCamps.value,
            'capLevel': 10
        });
        calculateItems(spells, 'spells', {
            'table': spellsTable,
            'levelValue': parseInt(spellFactoryLevel.value, 10),
            'space': spellFactoryLevel.value,
            'capLevel': 4
        });

        allBarracks.updateSavedData();

        savedData.set('armyCamps', armyCamps.value);
        savedData.set('spellFactoryLevel', spellFactoryLevel.selectedIndex);

        savedDataStorage.save(savedData.getAll());
    };


    var setDefaults = function() {
        allBarracks.setDefaults();
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
    };


    allBarracks.getAll().forEach(function(el) {
        el.addEventListener('change', calculate, false);
    });
    armyCamps.addEventListener('input', calculate, false);
    spellFactoryLevel.addEventListener('change', calculate, false);


    var setSpinner = function(el) {

        var plus = function() {
            var current = parseInt(el.value, 10);
            if (isNaN(current)) {
                el.value = 1;
            } else {
                el.value = current + 1;
            }
            calculate();
        };

        var minus = function(){
            var current = parseInt(el.value, 10);
            if (isNaN(current) || current < 2) {
                el.value = 0;
            } else {
                el.value = current - 1;
            }
            calculate();
        };

        var create = function(type){
            var span = document.createElement('span');
            span.className = 'like-button like-button_after';
            span.innerHTML = (type === 'plus' ? '+' : '−');

            span.addEventListener('click', (type === 'plus' ? plus : minus), false);

            var interval = null;
            var timeout = null;
            span.addEventListener('mousedown', function() {
                timeout = window.setTimeout(function(){
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

            if (type === 'units') {
                var i;
                var barracksTimes = [];
                for (i = 1; i <= 4; i++) {
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
    createRows(spells, 'spells');

    var selectAll = function(e) {
        if (e.target.tagName.toLowerCase() === 'input') {
            setTimeout(function(el){
                el.setSelectionRange(0, 9999);
            }.bind(null, e.target), 10);
        }
    };
    Array.prototype.slice.call(document.getElementsByClassName('js-number')).forEach(function(el){
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
                var barracksCount = barracksLevels.filter(function(barrackIndex, arrayIndex) {
                    return (arrayIndex === 0 ? true : barrackIndex > 0);
                }).length;
                templateVars.hasUnits = {
                    'units': unitsItems,
                    'totalCost': numberFormat(totalCost),
                    'totalCapacity': totalCapacity,
                    'armyCamps': data.get('armyCamps'),
                    'barracksCount': barracksCount
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
                        'spellsFactoryLevel': data.get('spellFactoryLevel'),
                    };
                }
            }

            content.push(savedListItemTemplate.render(templateVars));
        });

        var savedListContent = ids.get('saved-list-content');
        savedListContent.innerHTML = content.join('');

        Array.prototype.slice.call(savedListContent.getElementsByClassName('js-saved-load')).forEach(function(el){
            el.addEventListener('click', function(){
                savedData = new Dict(objectCopy(savedCalculations.retrieve(el.getAttribute('data-num')).getAll()));
                setDefaults();
                calculate();
                savedListCreateItems();
            }, false);
        });

        Array.prototype.slice.call(savedListContent.getElementsByClassName('js-saved-delete')).forEach(function(el){
            el.addEventListener('click', function(){
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
