var DOM_ENABLED = true;
if (typeof exports !== 'undefined') {
    DOM_ENABLED = false;
    var part = require('../part.js');
}

part('barracks', ['dom', 'savedData', 'events'], function(dom, savedData, events) {
    'use strict';

    var BarracksContainer = function(data) {
        this.data = data;

        var barracks = [];

        var updateHeader = function(num, level) {
            var header = '';
            if (level !== 0) {
                header = data.queue[level];
            }
            dom.id(data.type + '-barrack-header-' + num).textContent = header;
        };

        var updateSavedData = function(el) {
            savedData.current.set(el.getAttribute('id'), el.selectedIndex);
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
                    updateSavedData(el);
                    events.trigger('elChange', el);

                    updateHeader(el.getAttribute('data-num'), el.value);

                    events.trigger('calculate', {
                        'type': 'barrack-' + data.type
                    });
                });

                barracks.push(barrack);

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
                barracks.forEach(function(el) {
                    var saved = savedData.current.get(el.getAttribute('id'), el.selectedIndex);
                    el.options[saved].selected = true;
                    updateSavedData(el);

                    events.trigger('elChange', el, true);

                    updateHeader(el.getAttribute('data-num'), el.value);
                });
            });

            events.listen('updateSetting', function(params) {
                var value = params.helper(params.th, data.th);
                barracks.forEach(function(el) {
                    el.value = value;
                    updateSavedData(el);

                    events.trigger('elChange', el, true);

                    updateHeader(el.getAttribute('data-num'), el.value);
                });
            });
        }
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
