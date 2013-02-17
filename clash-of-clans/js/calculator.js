(function() {

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


    var getFormattedTime = function(time) {
        var formattedTime = '';
        if (time > 3599) {
            formattedTime += Math.floor(time / 3600) + 'h ';
            time = time % 3600;
        }
        if (time > 59) {
            formattedTime += Math.floor(time / 60) + 'm ';
            time = time % 60;
        }
        formattedTime += time + 's';
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

        this.setAll = function(values) {
            this.data = values;
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

        ids.get(type + '-time').innerHTML = getFormattedTime(Math.ceil(totalTime / params.buildings));
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

            span.addEventListener('click',(type === 'plus' ? plus : minus), false);

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

    var createRows = function(items, type) {
        var createLevelOption = function(value, index) {
            return '<option value="' + value + '">' + (index + 1) + '</option>';
        };

        var baseTemplate = document.getElementsByClassName('js-item-template')[0];

        var valueContent = '';
        if (type === 'spells') {
            var itemQuantityOptions = [];
            var i;
            for (i = 0; i < 5; i++) {
                itemQuantityOptions.push('<option value="' + i + '">' + i + '</option>');
            }
            valueContent = itemQuantityOptions.join('');
        }

        var itemsBody = ids.get(type + '-body');
        objectIterate(items, function(name, value) {
            var template = baseTemplate.cloneNode(true);

            var valueCell = template.getElementsByClassName('js-item-template-for-' + type)[0];
            valueCell.className = '';
            template.removeChild(template.getElementsByClassName('js-item-template-for')[0]);

            var templateVars = {
                'valueId': name,
                'valueTitle': convertToTitle(name),
                'levelId': name + '-level',
                'levelContent': value[1].map(createLevelOption).join(''),
                'costId': name + '-cost',
                'summaryId': name + '-summary',
                'valueContent': valueContent
            };

            var templateHTML = template.innerHTML;
            objectIterate(templateVars, function(varName, varValue) {
                templateHTML = templateHTML.replace(new RegExp('%' + varName + '%', 'g'), varValue);
            });

            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = '<table><tr>' + templateHTML + '</tr></table>';

            var itemRow = tempDiv.querySelector('tr');
            itemRow.setAttribute('id', type + '-building-level-' + value[3]);
            itemsBody.appendChild(itemRow);

            ids.get(templateVars.levelId).addEventListener('change', calculate, false);
            ids.get(templateVars.valueId).addEventListener((type === 'spells' ? 'change' : 'input'), calculate, false);
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

    var viewSavedToggle = function() {
        ids.get('view-saved').style.display = (savedCalculations.retrieve(0) ? '' : 'none');
    };

    var savedListCreateItems = function(isRedraw) {
        var savedList = ids.get('saved-list');
        if (savedList.style.display !== 'none') {
            savedList.style.display = 'none';
            ids.get('saved-list-content').innerHTML = '';
            if (!isRedraw) {
                savedData.set('savedListOpened', false);
                savedDataStorage.save(savedData.getAll());
                return;
            }
        }

        savedData.set('savedListOpened', true);
        savedDataStorage.save(savedData.getAll());

        var content = [];
        savedCalculations.forEach(function(data, index) {
            content.push('<div class="saved-list__item" id="saved-list-item-' + index + '">');

            content.push('<div class="saved-list__item-title">Units</div>');
            var totalCost = 0;
            var totalTime = 0;
            var totalCapacity = 0;
            objectIterate(units, function(name, unitValue) {
                var quantity = parseInt(data.get(name), 10) || 0;
                if (quantity > 0 && unitValue[3] <= (data.get('barracksLevel') + 1)) {
                    content.push(convertToTitle(name) +
                                 ' ' +
                                 (data.get(name + '-level') + 1) +
                                 'lvl &times;' +
                                 data.get(name) +
                                 '<br/>');
                    totalCost += unitValue[1][data.get(name + '-level')] * quantity;
                    totalTime += unitValue[0] * quantity;
                    totalCapacity += unitValue[2] * quantity;
                }
            });
            content.push('<div class="saved-list__item-result">All Troops Cost: ' +
                         numberFormat(totalCost) +
                         '<br/>Capacity: ' +
                         totalCapacity +
                         '/' +
                         data.get('armyCamps') +
                         '<br/>Time: ' +
                         getFormattedTime(Math.ceil(totalTime / (data.get('barracks') + 1))) +
                         ' (' + (data.get('barracks') + 1) + ' Barracks)' +
                        '</div>');

            if (data.get('spellFactoryLevel') > 0) {
                content.push('<div class="saved-list__item-title saved-list__item-title_next">Spells</div>');
                var spellsCost = 0;
                var spellsTime = 0;
                var spellsCapacity = 0;
                objectIterate(spells, function(spellName, spellValue) {
                    var spellQuantity = parseInt(data.get(spellName), 10) || 0;
                    if (spellQuantity > 0 && spellValue[3] <= data.get('spellFactoryLevel')) {
                        content.push(convertToTitle(spellName) +
                                     ' ' +
                                     (data.get(spellName + '-level') + 1) +
                                     'lvl &times;' +
                                     data.get(spellName) +
                                     '<br/>');
                        spellsCost += spellValue[1][data.get(spellName + '-level')] * spellQuantity;
                        spellsTime += spellValue[0] * spellQuantity;
                        spellsCapacity += spellValue[2] * spellQuantity;
                    }
                });
                content.push('<div class="saved-list__item-result">All Spells Cost: ' +
                             numberFormat(spellsCost) +
                             '<br/>Capacity: ' +
                             spellsCapacity +
                             '/' +
                             data.get('spellFactoryLevel') +
                             '<br/>Time: ' +
                             getFormattedTime(spellsTime) +
                             '</div>');
            }

            content.push('<div class="saved-list__actions">');
            content.push('<span class="like-button like-button_lonely js-saved-load" data-num="' +
                         index +
                         '" title="Current calculation will be lost">Load</span>');
            content.push('<span class="like-button like-button_lonely js-saved-delete" data-num="' +
                         index +
                         '">Delete</span>');
            content.push('</div>');
            content.push('</div>');
        });

        var savedListContent = ids.get('saved-list-content');
        savedListContent.innerHTML = content.join('');

        Array.prototype.slice.call(savedListContent.getElementsByClassName('js-saved-load')).forEach(function(el){
            el.addEventListener('click', function(){
                savedData = savedCalculations.retrieve(el.getAttribute('data-num'));
                setDefaults();
                calculate();
                savedListCreateItems();
            }, false);
        });

        Array.prototype.slice.call(savedListContent.getElementsByClassName('js-saved-delete')).forEach(function(el){
            el.addEventListener('click', function(){
                savedCalculations.remove(el.getAttribute('data-num'));
                savedCalculationsStorage.save(savedCalculations.getAll());
                viewSavedToggle();
                savedListCreateItems((savedCalculations.retrieve(0) ? true : false));
            }, false);
        });

        ids.get('saved-list').style.display = 'block';
    };

    ids.get('view-saved').addEventListener('click', function() {
        savedListCreateItems();
    });

    viewSavedToggle();

    if (savedData.get('savedListOpened')) {
        savedListCreateItems();
    }

    ids.get('save').addEventListener('click', function() {
        savedCalculations.insert(objectCopy(savedData.getAll()));
        savedCalculationsStorage.save(savedCalculations.getAll());
        viewSavedToggle();

        var saveSuccess = ids.get('save-success');
        saveSuccess.style.display = '';

        var baseOpacity = 100;
        var interval = window.setInterval(function(){
            baseOpacity -= 5;
            saveSuccess.style.opacity = (baseOpacity / 100).toString(10).replace('0.', '.');
            if (baseOpacity === 0) {
                saveSuccess.style.display = 'none';
                saveSuccess.style.opacity = '1';
                clearInterval(interval);
            }
        }, 50);
    }, false);


}());
