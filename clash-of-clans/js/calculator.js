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
                callback(key, obj[key]);
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


    var barracks = ids.get('barracks');
    var barracksLevel = ids.get('barracks-level');
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
        var levelValue = parseInt(params.levelSelect.value, 10);
        params.table.style.display = (levelValue === 0 ? 'none' : '');

        var i;
        for (
            i = parseInt(params.levelSelect.options[params.levelSelect.options.length - 1].value, 10);
            i >= 1;
            i--
        ) {
            ids.get(type + '-building-level-' + i).style.display = (i > levelValue ? 'none' : '');
        }

        var totalCost = 0;
        var totalSpace = 0;
        var totalTime = 0;
        objectIterate(items, function(name, value) {
            if (value[3] > levelValue) {
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
            totalTime += (value[0] * quantity);

            savedData.set(name, quantity);
            savedData.set(levelId, levelEl.selectedIndex);
        });

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

        ids.get(type + '-time').innerHTML = getFormattedTime(Math.ceil(totalTime / params.buildings), (type === 'spells' ? true : false));
    };


    var calculate = function() {
        calculateItems(units, 'units', {
            'table': unitsTable,
            'levelSelect': barracksLevel,
            'space': armyCamps.value,
            'buildings': barracks.value
        });
        calculateItems(spells, 'spells', {
            'table': spellsTable,
            'levelSelect': spellFactoryLevel,
            'space': spellFactoryLevel.value,
            'buildings': 1
        });

        savedData.set('barracks', barracks.selectedIndex);
        savedData.set('barracksLevel', barracksLevel.selectedIndex);
        savedData.set('armyCamps', armyCamps.value);
        savedData.set('spellFactoryLevel', spellFactoryLevel.selectedIndex);

        savedDataStorage.save(savedData.getAll());
    };


    var setDefaults = function() {
        barracks.options[savedData.get('barracks', barracks.selectedIndex)].selected = true;
        barracksLevel.options[savedData.get('barracksLevel', barracksLevel.selectedIndex)].selected = true;
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


    barracks.addEventListener('change', calculate, false);
    barracksLevel.addEventListener('change', calculate, false);
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
            var totalTime = 0;
            var totalCapacity = 0;
            objectIterate(units, function(name, unitValue) {
                var quantity = parseInt(data.get(name), 10) || 0;
                if (quantity > 0 && unitValue[3] <= (data.get('barracksLevel') + 1)) {
                    unitsItems.push({
                        'name': convertToTitle(name),
                        'level': (new Array(data.get(name + '-level') + 2)).join('*'),
                        'quantity': quantity
                    });
                    totalCost += unitValue[1][data.get(name + '-level')] * quantity;
                    totalTime += unitValue[0] * quantity;
                    totalCapacity += unitValue[2] * quantity;
                }
            });
            if (unitsItems.length) {
                templateVars.hasUnits = {
                    'units': unitsItems,
                    'totalCost': numberFormat(totalCost),
                    'totalCapacity': totalCapacity,
                    'armyCamps': data.get('armyCamps'),
                    'totalTime': getFormattedTime(Math.ceil(totalTime / (data.get('barracks') + 1)), true),
                    'barracksCount': (data.get('barracks') + 1)
                };
            }

            if (data.get('spellFactoryLevel') > 0) {
                var spellsItems = [];
                var spellsCost = 0;
                var spellsTime = 0;
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
                        spellsTime += spellValue[0] * spellQuantity;
                        spellsCapacity += spellValue[2] * spellQuantity;
                    }
                });
                if (spellsItems.length) {
                    templateVars.hasSpells = {
                        'spells': spellsItems,
                        'spellsCost': numberFormat(spellsCost),
                        'spellsCapacity': spellsCapacity,
                        'spellsFactoryLevel': data.get('spellFactoryLevel'),
                        'spellsTime': getFormattedTime(spellsTime, true)
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
