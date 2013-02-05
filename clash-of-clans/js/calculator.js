(function(){
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
        unitsTable = document.querySelector('.js-units'),
        savedData = {};

    if ('localStorage' in window) {
        savedData = localStorage.getItem('savedData');
        if (savedData) {
            savedData = JSON.parse(savedData);
        } else {
            savedData = {};
        }
    }

    for (var name in data) {
        var unit = data[name],
            unitRow = document.createElement('tr'),
            unitCells = [],
            unitLevelSelect = [];

        unitCells.push('<td><label for="' + name + '">' + name.replace('_', ' ').replace(/-/g, '.') + '</label></td>');

        var defaultValue = 0;
        if (savedData[name]) {
            defaultValue = savedData[name];
        }
        unitCells.push('<td><input id="' + name + '" size="4" oninput="calculate()" value="' + defaultValue + '"/></td>');

        var levelId = name + '-level';
        unitLevelSelect.push('<select id="' + levelId + '" onchange="calculate()">');
        for (var i = 0, levelLength = unit[2].length; i < levelLength; i++) {
            unitLevelSelect.push('<option value="' + unit[2][i] + '">' + (i + 1) + '</option>');
        }
        unitLevelSelect.push('</select>');

        unitCells.push('<td>' + unitLevelSelect.join('') + '</td>');

        unitRow.innerHTML = unitCells.join('');
        unitsTable.appendChild(unitRow);

        var levelIndex = 0;
        if (savedData[levelId]) {
            levelIndex = savedData[levelId];
        }
        var level = document.getElementById(levelId);
        level.options[levelIndex].selected = true;
    }

    var barracks = document.querySelector('.js-barracks'),
        result = document.querySelector('.js-result');

    if (savedData['barracks']) {
        barracks.value = savedData['barracks'];
    }

    window.calculate = function(){
        var totalPrice = 0,
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
                level = document.getElementById(levelId),
                price = level.value;

            totalPrice += (price * unit.value);
            totalSpace += (data[name][0] * unit.value);
            totalTime += (data[name][1] * unit.value);

            savedData[name] = unit.value;
            savedData[levelId] = level.selectedIndex;
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

        var output = [];
        output.push('<tr><th>Price</th><td>' + totalPrice.toString(10).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,') + '</td>');
        output.push('<tr><th>Capacity</th><td>' + totalSpace + '</td>');
        output.push('<tr><th>Average Production Time</th><td>' + formattedTime + '</td>');
        result.innerHTML = output.join('');

        if ('localStorage' in window) {
            localStorage.setItem('savedData', JSON.stringify(savedData));
        }
    };

    calculate();

})();