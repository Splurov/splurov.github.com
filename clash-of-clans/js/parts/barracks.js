var DOM_ENABLED = true;
if (typeof exports !== 'undefined') {
    DOM_ENABLED = false;
    var part = require('../part.js');
}

part('barracks', ['dom', 'savedData', 'events'], function(dom, savedData, events) {
    'use strict';

    var BarracksContainer = function(data) {
        this.barracks = [];
        this.data = data;

        if (DOM_ENABLED) {
            var i = 0;
            while (++i <= this.data.count) {
                var barrack = dom.id(this.data.prefix + '-levels-' + i);
                var j = -1;
                var options = [];
                while (++j <= this.data.maxLevel) {
                    if (i === 1 && j === 0 && this.data.firstRequired) {
                        continue;
                    }
                    var selected = '';
                    if (j === this.data.maxLevel) {
                        selected = ' selected="selected"';
                    }
                    options.push('<option value="' + j + '"' + selected + '>' + j + '</option>');
                }
                barrack.innerHTML = options.join('');

                dom.listen(barrack, ['change'], function(e) {
                    var el = e.currentTarget;
                    savedData.current.set(el.getAttribute('id'), el.selectedIndex);
                    events.trigger('elChange', el);

                    events.trigger('calculate', {
                        'type': 'barracks-' + this.data.type
                    });
                }.bind(this));

                this.barracks.push(barrack);

                var boostedId = this.data.prefix + '-boosted-' + i;
                var boostedEl = dom.id(boostedId);
                if (localStorage.getItem(boostedId) === 'yes') {
                    boostedEl.checked = true;
                }
                dom.listen(boostedEl, ['change'], function(e) {
                    var el = e.currentTarget;
                    localStorage.setItem(el.getAttribute('id'), (el.checked ? 'yes' : 'no'));
                    events.trigger('calculate', {
                        'type': this.data.type
                    });
                }.bind(this));
            }

            events.listen('updateFromSaved', function() {
                this.barracks.forEach(function(el) {
                    var saved = savedData.current.get(el.getAttribute('id'), el.selectedIndex);
                    el.options[saved].selected = true;

                    events.trigger('elChange', el, true);
                });
            }.bind(this));

            events.listen('updateSetting', function(params) {
                var value = params.helper(params.th, this.data.th);
                this.barracks.forEach(function(el) {
                    el.value = value;
                    savedData.current.set(el.getAttribute('id'), el.selectedIndex);
                    events.trigger('elChange', el, true);
                });
            }.bind(this));
        }

        this.getMaxLevel = function() {
            return Math.max.apply(null, this.barracks.map(function(el) {
                return parseInt(el.value, 10);
            }));
        };

        this.getAllNormalized = function() {
            return this.barracks.map(function(el) {
                return {
                    'level': parseInt(el.value, 10),
                    'queueLength': this.data.queue[el.value]
                };
            }, this);
        };

        this.getQueue = function() {
            return this.barracks.map(function(el) {
                var num = el.getAttribute('id').slice(-1);
                return {
                    'num': num,
                    'time': 0,
                    'space': 0,
                    'maxSpace': this.data.queue[el.value],
                    'units': {},
                    'level': parseInt(el.value, 10),
                    '__boostedId': this.data.prefix + '-boosted-' + num,
                    'isBoosted': function() {
                        return localStorage.getItem(this.__boostedId) === 'yes';
                    },
                    'getActualTime': function() {
                        if (this.isBoosted()) {
                            return Math.floor(this.time / 4);
                        }

                        return this.time;
                    }
                };
            }, this);
        };

        this.getActiveCount = function() {
            return this.barracks.filter(function(b){
                return b.value > 0;
            }).length;
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
