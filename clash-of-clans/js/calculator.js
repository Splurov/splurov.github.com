(function(){

    'use strict';


    var numberFormat = function(n) {
        return n.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    };


    var DataStorage = function(key) {
        var data = localStorage.getItem(key);
        if (data) {
            data = JSON.parse(data);
        } else {
            data = {};
        }

        this.get = function(key, defaultValue) {
            var value = data[key];
            if (defaultValue !== undefined && value === undefined) {
                return defaultValue;
            }
            return value;
        };

        this.set = function(key, value) {
            data[key] = value;
        };

        this.update = function() {
            localStorage.setItem(key, JSON.stringify(data));
        };

        return this;
    };


    var savedData = new DataStorage('savedData');


    var barracks = document.getElementById('barracks');
    barracks.options[savedData.get('barracks', barracks.selectedIndex)].selected = true;


    var barracksLevel = document.getElementById('barracks-level');
    barracksLevel.options[savedData.get('barracksLevel', barracksLevel.selectedIndex)].selected = true;


    var armyCamps = document.getElementById('army-camps');
    armyCamps.value = savedData.get('armyCamps', armyCamps.value);


    var spellFactoryLevel = document.getElementById('spell-factory-level');
    spellFactoryLevel.options[savedData.get('spellFactoryLevel', spellFactoryLevel.selectedIndex)].selected = true;


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
        },
        unitsTable = document.getElementById('units'),

        spells = {
            'Lightning': [3600, [15000, 16500, 18000, 20000, 22000], 1, 1],
            'Healing': [5400, [20000, 22000, 24000, 26500, 29000], 1, 2],
            'Rage': [7200, [30000, 33000, 36000, 40000, 44000], 1, 3],
            'Jump': [5400, [30000, 38000], 1, 4]
        },
        spellsTable = document.getElementById('spells');


    var calculateItems = function(items, type, params) {
        var levelValue = parseInt(params.levelSelect.value, 10);
        params.table.style.display = (levelValue === 0 ? 'none' : '');

        for (
            var i = parseInt(params.levelSelect.options[params.levelSelect.options.length - 1].value);
            i >= 1;
            i--
        ) {
            document.getElementById(type + '-building-level-' + i).style.display = (i > levelValue ? 'none' : '');
        }

        var totalCost = 0,
            totalSpace = 0,
            totalTime = 0,
            name;
        for (name in items) {
            if (items.hasOwnProperty(name) && items[name][3] <= levelValue) {
                var item = document.getElementById(name);

                var value = parseInt(item.value, 10) || 0;

                var levelId = name + '-level',
                    levelEl = document.getElementById(levelId),
                    costEl = document.getElementById(name + '-cost'),
                    summaryEl = document.getElementById(name + '-summary'),
                    costPerItem = levelEl.value,
                    summaryCost = (costPerItem * value);

                costEl.innerHTML = numberFormat(costPerItem);
                summaryEl.innerHTML = (summaryCost ? numberFormat(summaryCost) : 0);

                totalCost += summaryCost;

                totalSpace += (items[name][2] * value);
                totalTime += (items[name][0] * value);

                savedData.set(name, value);
                savedData.set(levelId, levelEl.selectedIndex);
            }
        }

        document.getElementById(type + '-cost').innerHTML = numberFormat(totalCost);

        var spaceDiff = params.space - totalSpace;
        if (spaceDiff < 0) {
            spaceDiff = '<span class="limit-exceeded">' + spaceDiff + '</span>';
        }
        document.getElementById(type + '-quantity').innerHTML = '(' + spaceDiff + ')';

        if (totalSpace > params.space) {
            totalSpace = '<span class="limit-exceeded">' + totalSpace + '</span>';
        }
        totalSpace = totalSpace + ' / ' + params.space;
        document.getElementById(type + '-space').innerHTML = totalSpace;

        var time = Math.ceil(totalTime / params.buildings),
            formattedTime = '';
        if (time > 3599) {
            formattedTime += Math.floor(time / 3600) + 'h ';
            time = time % 3600;
        }
        if (time > 59) {
            formattedTime += Math.floor(time / 60) + 'm ';
            time = time % 60;
        }
        formattedTime += time + 's';
        document.getElementById(type + '-time').innerHTML = formattedTime;
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

        savedData.update();
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
            span.className = 'number-' + type;
            span.innerHTML = (type === 'plus' ? '+' : '−');

            span.onclick = (type === 'plus' ? plus : minus);

            var interval = null,
                timeout = null;
            span.onmousedown = function(){
                timeout = window.setTimeout(function(){
                    interval = window.setInterval((type === 'plus' ? plus : minus), 100);
                }, 500);
            };
            span.onmouseup = function(){
                clearTimeout(timeout);
                clearInterval(interval);
            };
            el.parentNode.appendChild(span);
        };

        create('plus');
        create('minus');

    };

    var createRows = function(items, type) {
        for (var name in items) {
            if (items.hasOwnProperty(name)) {
                var item = items[name],
                    itemRow = document.createElement('tr');

                itemRow.setAttribute('id', type + '-building-level-' + item[3]);

                var td1 = document.createElement('td');
                td1.innerHTML = '<label for="' + name + '">' + name.replace('_', ' ').replace(/-/g, '.') + '</label>';
                itemRow.appendChild(td1);

                var levelId = name + '-level',
                    levelIndex = savedData.get(levelId, 0),
                    costPerItem,
                    itemLevelSelect = [];
                itemLevelSelect.push('<select id="' + levelId + '">');
                for (var i = 0, levelLength = item[1].length; i < levelLength; i++) {
                    var levelSelected = '';
                    if (i === levelIndex) {
                        levelSelected = ' selected="selected"';
                        costPerItem = item[1][i];
                    }
                    itemLevelSelect.push('<option value="' + item[1][i] + '"' + levelSelected + '>' + (i + 1) + '</option>');
                }
                itemLevelSelect.push('</select>');

                var td2 = document.createElement('td');
                td2.innerHTML = itemLevelSelect.join('');
                td2.firstChild.addEventListener('change', calculate, false);
                itemRow.appendChild(td2);

                var td3 = document.createElement('td'),
                    costId = name + '-cost';
                td3.setAttribute('id', costId);
                td3.className = 'number';
                td3.innerHTML = costPerItem;
                itemRow.appendChild(td3);

                var defaultValue = savedData.get(name) || 0,
                    td4 = document.createElement('td');
                if (type === 'spells') {
                    var itemQuantitySelect = [];
                    itemQuantitySelect.push('<select id="' + name + '">');
                    for (var i = 0; i < 5; i++) {
                        itemQuantitySelect.push('<option value="' + i + '"' + (i === defaultValue ? ' selected="selected"' : '') + '>' + i + '</option>');
                    }
                    itemQuantitySelect.push('</select>');
                    td4.innerHTML = itemQuantitySelect.join('');
                } else {
                    td4.innerHTML = '<input class="js-number" id="' + name + '" size="4" value="' + defaultValue + '"/>';
                }
                td4.firstChild.addEventListener((type === 'spells' ? 'change' : 'input'), calculate, false);
                itemRow.appendChild(td4);

                var summaryId = name + '-summary',
                    td5 = document.createElement('td');
                td5.setAttribute('id', summaryId);
                td5.className = 'number';
                td5.innerHTML = (defaultValue ? numberFormat(costPerItem * defaultValue) : 0);
                itemRow.appendChild(td5);

                document.getElementById(type + '-body').appendChild(itemRow);
            }
        }
    };

    createRows(units, 'units');
    createRows(spells, 'spells');

    var numbers = document.querySelectorAll('.js-number');
    var selectAll = function(e) {
        if (e.target.tagName.toLowerCase() === 'input') {
            setTimeout(function(el){
                el.setSelectionRange(0, 9999);
            }.bind(null, e.target), 10);
        }
    };
    for (var i = 0, numberLength = numbers.length; i < numberLength; i++) {
        numbers[i].addEventListener('focus', selectAll, false);
        setSpinner(numbers[i]);
    }

    calculate();

})();
