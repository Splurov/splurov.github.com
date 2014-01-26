if (typeof exports !== 'undefined') {
    var part = require('./../part.js');
}

part('common', ['dom'], function(dom) {

    'use strict';

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
                formattedTime += Math.floor(remainingTime / 3600) + 'h&thinsp;';
                remainingTime %= 3600;
                hideSeconds = true;
            }

            if (remainingTime > 59) {
                var minutes = Math.floor(remainingTime / 60);
                remainingTime %= 60;
                if (hideSeconds && remainingTime) {
                    minutes++;
                }
                formattedTime += minutes + 'm&thinsp;';
            } else {
                formattedTime += '0m&thinsp;';
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
        }
    };

});
