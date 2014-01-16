if (typeof exports !== 'undefined') {
    var part = require('./../part.js');
}

part('common', ['dom'], function(dom) {

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

    return {
        'objectCopy': function(obj) {
            var newObj = obj.constructor();
            Object.keys(obj).forEach(function(key) {
                newObj[key] = obj[key];
            });
            return newObj;
        },

        'numberFormat': function(n) {
            return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },

        'convertToTitle': function(s) {
            return s.replace('_', ' ').replace(/-/g, '.');
        },

        'getFormattedTime': function(time, hideSeconds) {
            var formattedTime = '';
            var remainingTime = time;

            if (remainingTime > 3599) {
                formattedTime += Math.floor(remainingTime / 3600) + 'h ';
                remainingTime %= 3600;
                hideSeconds = true;
            }

            if (remainingTime > 59) {
                var minutes = Math.floor(remainingTime / 60);
                remainingTime %= 60;
                if (hideSeconds && remainingTime > 0) {
                    minutes++;
                }
                formattedTime += minutes + 'm ';
            } else {
                formattedTime += '0m ';
            }

            if (formattedTime === '' || !hideSeconds) {
                formattedTime += remainingTime + 's';
            }

            return formattedTime;
        },

        'Dict': function(data) {
            this.data = data;

            this.get = function(key, defaultValue) {
                var value = this.data[key];
                if (defaultValue !== undefined && (value === undefined || value === null)) {
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
        },

        'infoMessage': function(id, isAutoHide) {
            var el;
            var hide;
            var timeout;

            el = dom.id(id);

            hide = function() {
                clearTimeout(timeout);
                el.style.display = 'none';
            };

            dom.listen(el, ['universalClick'], hide);

            return {
                'show': function() {
                    el.style.display = 'inline-block';
                    if (isAutoHide) {
                        timeout = setTimeout(function() {
                            el.style.display = 'none';
                        }, 2000);
                    }
                },
                'hide': hide
            };
        }
    };

});
