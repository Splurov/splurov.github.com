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
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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


    var savedDataStorage = new DataStorage('savedData', {});
    var savedData = new Dict(savedDataStorage.load());


    var BarracksContainer = function(maxCount, selectName, saveName, queueLengths) {
        this.barracks = [];
        this.maxCount = maxCount;
        this.saveName = saveName;
        this.queueLengths = queueLengths;

        var i;
        for (i = 1; i <= this.maxCount; i++) {
            var barrack = document.getElementById(selectName + '-' + i);
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

        this.getMinLevel = function() {
            return Math.min.apply(null, this.barracks.map(function(el) {
                // Infinity for zero values
                return parseInt(el.value, 10) || Infinity;
            }));
        };

        this.getAllNormalized = function() {
            return this.barracks.map(function(el) {
                return {
                    'level': parseInt(el.value, 10),
                    'queueLength': this.queueLengths[el.value]
                };
            }, this);
        };

        this.getQueue = function() {
            return this.barracks.map(function(el) {
                return {
                    'num': el.getAttribute('id').slice(-1),
                    'time': 0,
                    'space': 0,
                    'maxSpace': this.queueLengths[el.value],
                    'units': {},
                    'level': parseInt(el.value, 10)
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


    var armyCamps = document.getElementById('army-camps');
    var spellFactoryLevel = document.getElementById('spell-factory-level');


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


    var typesSortedLevel = {};
    objectIterate(types, function(type, items) {
        typesSortedLevel[type] = [];
        objectIterate(items, function(name, objects) {
            typesSortedLevel[type].unshift(objects.concat(name));
        });
    });


    var currentSpace = {
        'units': 0,
        'dark': 0
    };


    var setQuantityAndSpace = function(maxSpace, totalSpace, type) {
        var spaceDiff = maxSpace - totalSpace;
        if (spaceDiff < 0) {
            spaceDiff = '<span class="limit-exceeded">' + spaceDiff + '</span>';
        }
        document.getElementById(type + '-quantity').innerHTML = '(' + spaceDiff + ')';

        var space = totalSpace;
        if (totalSpace > maxSpace) {
            space = '<span class="limit-exceeded">' + totalSpace + '</span>';
        }
        space = space + ' / ' + maxSpace;
        document.getElementById(type + '-space').innerHTML = space;
    };


    var suitableBarracksSort = function(a, b) {
        // minimum time first
        if (a.time < b.time) {
            return -1;
        }
        if (a.time > b.time) {
            return 1;
        }

        // minimum space first
        if (a.space < b.space) {
            return -1;
        }
        if (a.space > b.space) {
            return 1;
        }

        // minimum max space first
        if (a.maxSpace < b.maxSpace) {
            return -1;
        }
        if (a.maxSpace > b.maxSpace) {
            return 1;
        }

        return 0;
    };


    var timeSuitableBarracksSort = function(a, b) {
        // minimum level first
        if (a.level < b.level) {
            return -1;
        }
        if (a.level > b.level) {
            return 1;
        }

        // minimum time first
        if (a.time < b.time) {
            return -1;
        }
        if (a.time > b.time) {
            return 1;
        }

        // minimum space first
        if (a.space < b.space) {
            return -1;
        }
        if (a.space > b.space) {
            return 1;
        }

        return 0;
    };


    var getSuitableBarrack = function(barracks, requiredLevel, requiredSpace, requiredTime, avgTime) {
        var suitable = barracks.filter(function(barrack) {
            return barrack.level >= requiredLevel && (barrack.space + requiredSpace) <= barrack.maxSpace;
        });

        if (!suitable.length) {
            return null;
        }

        if (suitable.length > 1) {
            if (requiredSpace === 1) {
                var timeSuitable = suitable.filter(function(barrack) {
                    return (barrack.time + requiredTime) <= avgTime;
                });
                if (timeSuitable.length) {
                    if (timeSuitable.length > 1) {
                        timeSuitable.sort(timeSuitableBarracksSort);
                    }
                    return timeSuitable[0];
                }
            }

            suitable.sort(suitableBarracksSort);
        }

        return suitable[0];
    };


    var fillBarracks = function(barracksQueue, unitsDistribution, avgTime) {
        var stopDistribution = false;

        var udIndex; // ud - units distribution
        var udLength;
        for (udIndex = 0, udLength = unitsDistribution.length; udIndex < udLength; udIndex++) {
            var kit = unitsDistribution[udIndex];
            var kitTime = kit[3];
            var kitSpace = kit[4];
            var i;
            var barrack = null;
            for (i = 0; i < kit[1]; i++) {
                var isGetBarrack = true;
                if (barrack) {
                    var newTime = barrack.time + kitTime;
                    var newSpace = barrack.space + kitSpace;
                    if (newTime < (avgTime / 3) ||
                        (newSpace < (barrack.maxSpace / 4) && newTime < avgTime) ||
                        (kitSpace === 1 && newTime < avgTime && newSpace < barrack.maxSpace)) {
                        isGetBarrack = false;
                    }
                }

                if (isGetBarrack) {
                    barrack = getSuitableBarrack(barracksQueue, kit[2], kitSpace, kitTime, avgTime);
                }

                if (barrack === null) {
                    stopDistribution = true;
                    break;
                }

                if (barrack.units[kit[0]]) {
                    barrack.units[kit[0]]++;
                } else {
                    barrack.units[kit[0]] = 1;
                }

                barrack.time += kitTime;
                barrack.space += kitSpace;
            }
        }

        return !stopDistribution;
    };


    var populateDistribution = function(fillSuccess, type, barracksQueue) {
        var bqIndex;
        var bqLength = barracksQueue.length;
        if (fillSuccess) {
            document.getElementById(type + '-barracks-exceeded').style.display = 'none';
            var maxTime = 0;
            var maxNum = 1;
            for (bqIndex = 0; bqIndex < bqLength; bqIndex++) {
                var barrack = barracksQueue[bqIndex];

                var unitIndex;
                for (unitIndex in barrack.units) {
                    if (barrack.units[unitIndex] > 0) {
                        document.getElementById(
                            'quantity-' +
                            typesSortedLevel[type][unitIndex][4] +
                            '-' +
                            barrack.num
                        ).textContent = '×' + barrack.units[unitIndex];
                    }
                }

                if (barrack.time > maxTime) {
                    maxTime = barrack.time;
                    maxNum = barrack.num;
                }

                document.getElementById(
                    type +
                    '-time-barrack-' +
                    barrack.num
                ).textContent = (barrack.time ? getFormattedTime(barrack.time) : '');
            }
            var maxBarrack = document.getElementById(type + '-time-barrack-' + maxNum);
            maxBarrack.innerHTML = '<span class="result">' + maxBarrack.textContent + '</span>';
        } else {
            document.getElementById(type + '-barracks-exceeded').style.display = '';
            for (bqIndex = 0; bqIndex < bqLength; bqIndex++) {
                document.getElementById(type + '-time-barrack-' + barracksQueue[bqIndex].num).textContent = '';
            }
        }
    };


    var distributionNoLevelSort = function(a, b) {
        // maximum space first
        if (a[3] < b[3]) {
            return 1;
        }
        if (a[3] > b[3]) {
            return -1;
        }

        // maximum time first
        if (a[4] < b[4]) {
            return 1;
        }
        if (a[4] > b[4]) {
            return -1;
        }

        return 0;
    };


    var calculateItems = function(type, params) {
        document.getElementById(type).style.display = (params.levelValue === 0 ? 'none' : '');

        var clIndex; // cl - cap level
        for (
            clIndex = params.capLevel;
            clIndex >= 1;
            clIndex--
        ) {
            document.getElementById(
                type +
                '-building-level-' +
                clIndex
            ).style.display = (clIndex > params.levelValue ? 'none' : '');
        }

        if (type !== 'spells') {
            var barracksMaxCount = allBarracks[type].getMaxCount();
        }

        var totalCost = 0;
        var totalSpace = 0;
        var totalTime = 0;
        var maxUnitTime = 0;
        var distribution = [];

        var tsIndex; // ts - types sorted
        var tsLength;
        for (tsIndex = 0, tsLength = typesSortedLevel[type].length; tsIndex < tsLength; tsIndex++) {
            var value = typesSortedLevel[type][tsIndex];
            if (value[3] > params.levelValue) {
                continue;
            }

            var name = value[4];
            var item = document.getElementById(name);

            var quantity = parseInt(item.value, 10) || 0;
            if (quantity < 0) {
                quantity = 0;
            }
            if (item.value !== '') {
                item.value = quantity;
            }

            var levelId = name + '-level';
            var levelEl = document.getElementById(levelId);
            var summaryEl = document.getElementById(name + '-summary');
            var costPerItem = levelEl.value;
            var summaryCost = (costPerItem * quantity);

            summaryEl.textContent = (summaryCost ? numberFormat(summaryCost) : 0);

            totalCost += summaryCost;

            totalSpace += (value[2] * quantity);
            if (type === 'spells') {
                totalTime += (value[0] * quantity);
            } else {
                var mcIndex; // mc - max count
                for (mcIndex = 1; mcIndex <= allBarracks[type].getMaxCount(); mcIndex++) {
                    document.getElementById('quantity-' + name + '-' + mcIndex).textContent = '';
                }

                var subtractId = name + '-subtract';
                var subtract = document.getElementById(subtractId);
                var subtractQuantity = parseInt(subtract.value, 10) || 0;
                if (subtractQuantity < 0) {
                    subtractQuantity = 0;
                }
                if (subtract.value !== '') {
                    subtract.value = subtractQuantity;
                }

                var totalQuantity = quantity - subtractQuantity;
                if (totalQuantity > 0) {
                    distribution.push([
                        tsIndex,
                        quantity - subtractQuantity,
                        value[3], // level
                        value[0], // time
                        value[2] // space
                    ]);
                    maxUnitTime = Math.max(maxUnitTime, value[0]);
                    totalTime += (value[0] * totalQuantity);
                }

                savedData.set(subtractId, subtractQuantity);
            }

            savedData.set(name, quantity);
            savedData.set(levelId, levelEl.selectedIndex);
        }

        document.getElementById(type + '-cost').textContent = numberFormat(totalCost);

        if (type === 'spells') {
            setQuantityAndSpace(params.space, totalSpace, type);
            document.getElementById(type + '-time').textContent = getFormattedTime(totalTime, true);
        } else {
            var barracksQueue = allBarracks[type].getQueue();
            var avgTime = Math.max(Math.ceil(totalTime / allBarracks[type].getActiveCount()), maxUnitTime);

            var unitMaxLevel = Math.max.apply(null, distribution.map(function(item) {
                return item[2];
            }));
            if (unitMaxLevel < allBarracks[type].getMinLevel()) {
                distribution.sort(distributionNoLevelSort);
            }

            var fillSuccess = fillBarracks(barracksQueue, distribution, avgTime);

            populateDistribution(fillSuccess, type, barracksQueue);

            currentSpace[type] += totalSpace;
        }
    };


    var updateBarracksHeaders = function(type) {
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
            document.getElementById(type + '-barrack-header-' + (barrackIndex + 1)).innerHTML = header;
        });
    };


    var calculateDelayLong = null;
    var calculateDelayShort = null;


    var calculate = function(type) {
        clearTimeout(calculateDelayLong);
        clearTimeout(calculateDelayShort);
        calculateDelayLong = null;

        if (type === 'all' || type !== 'spells') {

            if (type === 'all' || type === 'barrack-units') {
                updateBarracksHeaders('units');
            }

            if (type === 'all' || type === 'barrack-dark') {
                updateBarracksHeaders('dark');
            }

            var armyCampsSpace = parseInt(armyCamps.value, 10);
            if (isNaN(armyCampsSpace) || armyCampsSpace < 0) {
                armyCampsSpace = 0;
            }
            var armyCampsMaxSpace = armyCamps.getAttribute('max');
            if (armyCampsSpace > armyCampsMaxSpace) {
                armyCampsSpace = armyCampsMaxSpace;
            }
            armyCamps.value = armyCampsSpace;

            if (type === 'all' || type === 'units' || type === 'barrack-units') {
                currentSpace.units = 0;
                calculateItems('units', {
                    'levelValue': allBarracks.units.getMaxLevel(),
                    'capLevel': allBarracks.units.getCapLevel()
                });
            }

            if (type === 'all' || type === 'dark' || type === 'barrack-dark') {
                currentSpace.dark = 0;
                calculateItems('dark', {
                    'levelValue': allBarracks.dark.getMaxLevel(),
                    'capLevel': allBarracks.dark.getCapLevel()
                });
            }

            var togetherSpace = currentSpace.units + currentSpace.dark;
            setQuantityAndSpace(armyCampsSpace, togetherSpace, 'units');
            setQuantityAndSpace(armyCampsSpace, togetherSpace, 'dark');

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
                var levelEl = document.getElementById(levelId);
                levelEl.options[savedData.get(levelId, levelEl.selectedIndex)].selected = true;

                var valueEl = document.getElementById(name);
                if (type === 'spells') {
                    valueEl.options[savedData.get(name, valueEl.selectedIndex)].selected = true;
                } else {
                    valueEl.value = savedData.get(name) || 0;

                    var subtractId = name + '-subtract';
                    document.getElementById(subtractId).value = savedData.get(subtractId) || 0;
                }
            });
        };

        setItems('units');
        setItems('spells');
        setItems('dark');
    };


    objectIterate(allBarracks, function(k, v) {
        v.getElements().forEach(function(el) {
            el.addEventListener('change', calculate.bind(null, 'barrack-' + k), false);
        });
    });
    armyCamps.addEventListener('input', calculate.bind(null, 'all'), false);
    spellFactoryLevel.addEventListener('change', calculate.bind(null, 'spells'), false);


    var spinnerAction = function(eventElement) {
        var targetElement = eventElement.spinnerTarget;
        var multiplier = parseInt(targetElement.getAttribute('data-multiplier'), 10) || 1;
        var current = parseInt(targetElement.value, 10);
        if (eventElement.textContent === '+') {
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
        calculate(targetElement.getAttribute('data-object-type'));
    };


    var spinnerInterval = null;
    var spinnerTimeout = null;


    var spinnerHold = function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.target.spinnerClicked = true;
        spinnerTimeout = window.setTimeout(function(eventElement) {
            eventElement.spinnerClicked = false;
            (function fakeInterval() {
                spinnerInterval = window.setTimeout(function() {
                    spinnerAction(eventElement);
                    fakeInterval();
                }, 100);
            }());
        }.bind(null, e.target), 500);
    };


    var spinnerRelease = function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.target.spinnerClicked) {
            spinnerAction(e.target);
        }
        clearTimeout(spinnerTimeout);
        clearInterval(spinnerInterval);
    };


    var setSpinner = function(type, el) {
        var span = document.createElement('span');
        span.className = 'like-button like-button_after';
        span.textContent = (type === 'plus' ? '+' : '−');
        span.spinnerTarget = el;

        span.addEventListener('touchstart', spinnerHold);
        span.addEventListener('touchend', spinnerRelease);
        span.addEventListener('mousedown', spinnerHold);
        span.addEventListener('mouseup', spinnerRelease);

        if (el.nextSibling) {
            el.parentNode.insertBefore(span, el.nextSibling);
        } else {
            el.parentNode.appendChild(span);
        }
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

        var itemsBody = document.getElementById(type + '-body');
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

            document.getElementById(templateVars.levelId).addEventListener(
                'change',
                calculate.bind(null, type),
                false
            );
            document.getElementById(templateVars.id).addEventListener(
                (type === 'spells' ? 'change' : 'input'),
                calculate.bind(null, type),
                false
            );

            if (type === 'units' || type === 'dark') {
                document.getElementById(templateVars.subtractId).addEventListener(
                    'input',
                    calculate.bind(null, type),
                    false
                );
            }
        });
    };


    createRows('units', 100);
    createRows('dark', 200);
    createRows('spells', 300);


    var selectAll = function(e) {
        if (e.target.tagName.toLowerCase() === 'input') {
            window.setTimeout(function(el) {
                el.setSelectionRange(0, 9999);
            }.bind(null, e.target), 10);
        }
    };


    toArray(document.getElementsByClassName('js-number')).forEach(function(el) {
        el.addEventListener('focus', selectAll, false);
        setSpinner('minus', el);
        setSpinner('plus', el);
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
            document.getElementById(key).value = '0';
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

        var savedListContent = document.getElementById('saved-list-content');
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

    document.getElementById('save').addEventListener('click', save, false);
    document.getElementById('save').addEventListener('touchend', save, false);

    savedListCreateItems();

}(window, document));
