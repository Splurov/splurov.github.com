var DOM_ENABLED = true;
if (typeof exports !== 'undefined') {
    DOM_ENABLED = false;
    var part = require('../part.js');
}

part('barracks', ['dom', 'savedData', 'events'], function(dom, savedData, events) {
    'use strict';

    var BarracksContainer = function(data) {
        this.data = data;
        this.barracks = [];

        var updateHeader = function(num, level) {
            var header = '';
            if (level !== 0) {
                header = data.queue[level];
            }
            dom.id(data.type + '-barrack-header-' + num).textContent = header;
        };

        var getLevelsFromSaved = function() {
            var levels = [];
            var i = 0;
            while (++i <= data.count) {
                var value = savedData.current.get(data.prefix + '-levels-' + i);
                if (i === 1 && data.firstRequired) {
                    value += 1;
                }
                levels.push(value);
            }
            return levels;
        };

        if (DOM_ENABLED) {
            var i = 0;
            while (++i <= data.count) {
                var barrack = dom.id(data.prefix + '-levels-' + i);
                var num = i.toString();
                barrack.setAttribute('data-num', num);
                var j = -1;
                var options = [];
                while (++j <= data.maxLevel) {
                    if (i === 1 && j === 0 && data.firstRequired) {
                        continue;
                    }
                    var selected = '';
                    if (j === data.maxLevel) {
                        selected = ' selected="selected"';
                    }
                    options.push('<option value="' + j + '"' + selected + '>' + j + '</option>');
                }
                barrack.innerHTML = options.join('');

                dom.listen(barrack, ['change'], function(e) {
                    var el = e.currentTarget;
                    savedData.current.set(el.getAttribute('id'), el.selectedIndex);
                    events.trigger('elChange', el);

                    updateHeader(el.getAttribute('data-num'), el.value);

                    events.trigger('calculate', {
                        'type': 'barrack-' + data.type
                    });
                });

                this.barracks.push(barrack);

                var boostedId = data.prefix + '-boosted-' + i;
                var boostedEl = dom.id(boostedId);
                boostedEl.setAttribute('data-num', num);
                if (localStorage.getItem(boostedId) === 'yes') {
                    boostedEl.checked = true;
                }
                dom.listen(boostedEl, ['change'], function(e) {
                    var el = e.currentTarget;
                    localStorage.setItem(el.getAttribute('id'), (el.checked ? 'yes' : 'no'));
                    events.trigger('calculate', {
                        'type': data.type
                    });
                });
            }

            events.listen('updateFromSaved', function() {
                this.barracks.forEach(function(el) {
                    var saved = savedData.current.get(el.getAttribute('id'), el.selectedIndex);
                    el.options[saved].selected = true;

                    events.trigger('elChange', el, true);

                    updateHeader(el.getAttribute('data-num'), el.value);
                });
            }.bind(this));

            events.listen('updateSetting', function(params) {
                var value = params.helper(params.th, data.th);
                this.barracks.forEach(function(el) {
                    el.value = value;
                    savedData.current.set(el.getAttribute('id'), el.selectedIndex);

                    events.trigger('elChange', el, true);

                    updateHeader(el.getAttribute('data-num'), el.value);
                });
            }.bind(this));
        }

        this.getMaxLevel = function() {
            return Math.max.apply(null, getLevelsFromSaved());
        };

        this.getQueue = function() {
            return getLevelsFromSaved().map(function(level, index) {
                var num = index + 1;
                return {
                    'num': num,
                    'time': 0,
                    'space': 0,
                    'maxSpace': data.queue[level],
                    'units': {},
                    'level': level,
                    'isBoosted': localStorage.getItem(data.prefix + '-boosted-' + num) === 'yes',
                    'getActualTime': function() {
                        if (this.isBoosted) {
                            return Math.floor(this.time / 4);
                        }

                        return this.time;
                    }
                };
            });
        };

    };

    return {
        'units': new BarracksContainer({
            'type': 'units',
            'prefix': 'barracks',
            'count': 4,
            'queue': [0, 20, 25, 30, 35, 40, 45, 50, 55, 60, 75],
            'maxLevel': 10,
            'firstRequired': true,
            'th': {
                1: 3,
                2: 4,
                3: 5,
                4: 6,
                5: 7,
                6: 8,
                7: 9,
                8: 10
            }
        }),
        'dark': new BarracksContainer({
            'type': 'dark',
            'prefix': 'dark-barracks',
            'count': 2,
            'queue': [0, 40, 50, 60, 70, 80],
            'maxLevel': 5,
            'th': {
                1: 0,
                7: 2,
                8: 4,
                9: 5
            }
        })
    };
});
