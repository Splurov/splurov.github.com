if (typeof exports !== 'undefined') {
    var part = require('./../part.js');
}

part('common', function() {

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
            var formattedTime = [];
            var remainingTime = time;

            if (remainingTime > 3599) {
                formattedTime.push(Math.floor(remainingTime / 3600) + 'h');
                remainingTime %= 3600;
                hideSeconds = true;
            }

            if (remainingTime > 59) {
                var minutes = Math.floor(remainingTime / 60);
                remainingTime %= 60;
                if (hideSeconds && remainingTime) {
                    minutes++;
                }
                formattedTime.push(minutes + 'm');
            } else {
                formattedTime.push('0m');
            }

            if (formattedTime === '' || !hideSeconds) {
                formattedTime.push(remainingTime + 's');
            }

            return formattedTime.join('&thinsp;');
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
