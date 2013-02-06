(function(){

    var Spinner = function(el) {

        this.el = el;

        this.plus = function() {
            var current = parseInt(this.el.value);
            if (isNaN(current)) {
                this.el.value = 1;
            } else {
                this.el.value = current + 1;
            }
            calculate();
        };

        this.minus = function(el){
            var current = parseInt(this.el.value);
            if (isNaN(current) || current < 2) {
                this.el.value = '';
            } else {
                this.el.value = current - 1;
            }
            calculate();
        };

        this.create = function(type){
            var span = document.createElement('span');
            span.className = 'number-' + type;
            span.innerHTML = (type == 'plus' ? '+' : '−');

            span.onclick = this[type].bind(this);

            var interval = null,
                timeout = null;
            span.onmousedown = function(){
                timeout = window.setTimeout(function(){
                    interval = window.setInterval(this[type].bind(this), 100);
                }.bind(this), 500);
            }.bind(this);
            span.onmouseup = function(){
                clearTimeout(timeout);
                clearInterval(interval);
            };
            el.parentNode.appendChild(span);
        };

        this.create('plus');
        this.create('minus');

    };

    var numberFormat = function(n) {
        return n.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    };

    var savedData = {};
    if ('localStorage' in window) {
        savedData = localStorage.getItem('savedData');
        if (savedData) {
            savedData = JSON.parse(savedData);
        } else {
            savedData = {};
        }
    }

    var data = {
            'Barbarian': [1, 20, [25, 40, 60, 80, 100, 150]],
            'Archer': [1, 25, [50, 80, 120, 160, 200, 300]],
            'Goblin': [1, 30, [25, 40, 60, 80, 100]],
            'Giant': [5, 120, [500, 1000, 1500, 2000, 2500, 3000]],
            'Wall_Breaker': [1, 120, [1000, 1500, 2000, 2500, 3000]],
            'Balloon': [5, 600, [2000, 2500, 3000, 3500, 4000, 4500]],
            'Wizard': [4, 600, [1500, 2000, 2500, 3000, 3500]],
            'Healer': [20, 1200, [7000, 10000, 13000]],
            'Dragon': [20, 1800, [25000, 32500, 40000]],
            'P-E-K-K-A-': [25, 3600, [35000, 42500, 50000]]
        },
        unitsTable = document.getElementById('units');

    for (var name in data) {
        var unit = data[name],
            unitRow = document.createElement('tr'),
            unitLevelSelect = [];

        var td1 = document.createElement('td');
        td1.innerHTML = '<label for="' + name + '">' + name.replace('_', ' ').replace(/-/g, '.') + '</label>';
        unitRow.appendChild(td1);

        var levelId = name + '-level',
            levelIndex = 0,
            costPerUnit;
        if (savedData[levelId]) {
            levelIndex = savedData[levelId];
        }
        unitLevelSelect.push('<select id="' + levelId + '" onchange="calculate()">');
        for (var i = 0, levelLength = unit[2].length; i < levelLength; i++) {
            var levelSelected = '';
            if (i == levelIndex) {
                levelSelected = ' selected="selected"';
                costPerUnit = unit[2][i];
            }
            unitLevelSelect.push('<option value="' + unit[2][i] + '"' + levelSelected + '>' + (i + 1) + '</option>');
        }
        unitLevelSelect.push('</select>');

        var td2 = document.createElement('td');
        td2.innerHTML = unitLevelSelect.join('');
        unitRow.appendChild(td2);

        var td3 = document.createElement('td'),
            costId = name + '-cost';
        td3.setAttribute('id', costId);
        td3.className = 'number';
        td3.innerHTML = costPerUnit;
        unitRow.appendChild(td3);

        var defaultValue = '',
            td4 = document.createElement('td');
        if (savedData[name]) {
            defaultValue = savedData[name];
        }
        td4.innerHTML = '<input class="js-number" id="' + name + '" size="4" oninput="calculate()" value="' + defaultValue + '"/>';
        unitRow.appendChild(td4);

        var summaryId = name + '-summary',
            td5 = document.createElement('td');
        td5.setAttribute('id', summaryId);
        td5.className = 'number';
        td5.innerHTML = (defaultValue ? numberFormat(costPerUnit * defaultValue) : '');
        unitRow.appendChild(td5);

        unitsTable.appendChild(unitRow);
    }

    var numbers = document.querySelectorAll('.js-number');
    for (var i = 0, numberLength = numbers.length; i < numberLength; i++) {
        new Spinner(numbers[i]);
    }

    var barracks = document.getElementById('barracks');

    if (savedData['barracks']) {
        barracks.value = savedData['barracks'];
    }

    window.calculate = function(){
        var totalCost = 0,
            totalSpace = 0,
            totalTime = 0,
            savedData = {};
        for (var name in data) {
            var unit = document.getElementById(name);

            if (unit.value < 0) {
                unit.value = 0;
            } else if (unit.value > 9999) {
                unit.value = 9999;
            }

            var levelId = name + '-level',
                levelEl = document.getElementById(levelId),
                costEl = document.getElementById(name + '-cost'),
                summaryEl = document.getElementById(name + '-summary'),
                costPerUnit = levelEl.value,
                summaryCost = (costPerUnit * unit.value);

            costEl.innerHTML = numberFormat(costPerUnit);
            summaryEl.innerHTML = (summaryCost ? numberFormat(summaryCost) : '');

            totalCost += summaryCost;
            totalSpace += (data[name][0] * unit.value);
            totalTime += (data[name][1] * unit.value);

            savedData[name] = unit.value;
            savedData[levelId] = levelEl.selectedIndex;
        }

        savedData['barracks'] = barracks.value;

        var time = Math.ceil(totalTime / barracks.value),
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

        document.getElementById('total-cost').innerHTML = numberFormat(totalCost);
        document.getElementById('total-space').innerHTML = totalSpace;
        document.getElementById('total-time').innerHTML = formattedTime;

        if ('localStorage' in window) {
            localStorage.setItem('savedData', JSON.stringify(savedData));
        }
    };

    calculate();

})();
