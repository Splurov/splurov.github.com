(function(window) {

    'use strict';

    var mk = {};

    window.mk = mk;

    mk.toArray = function(likeArrayObject) {
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
            var args = mk.toArray(arguments).slice(1);
            return function() {
                return self.apply(context, args.concat(mk.toArray(arguments)));
            };
        };
    }

    mk.objectIterate = function(obj, callback) {
        var key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (callback(key, obj[key]) === false) {
                    break;
                }
            }
        }
    };

    mk.objectCopy = function(obj) {
        var newObj = obj.constructor();
        mk.objectIterate(obj, function(key, value) {
            newObj[key] = value;
        });
        return newObj;
    };

    mk.numberFormat = function(n) {
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    mk.convertToTitle = function(s) {
        return s.replace('_', ' ').replace(/-/g, '.');
    };

    mk.getWikiaLink = function(s) {
        return 'http://clashofclans.wikia.com/wiki/' + s.replace(' ', '_');
    };

    mk.getFormattedTime = function(time, hideSeconds) {
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

    mk.Dict = function(data) {
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
    };

    mk.MultiDict = function(entries) {
        this.entries = [];

        this.retrieve = function(i) {
            return this.entries[i] || new mk.Dict({});
        };

        this.update = function(i, data) {
            this.entries[i] = data;
        };

        this.insert = function(data) {
            this.entries.push(new mk.Dict(data));
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

    mk.selectAll = function(e) {
        if (e.target.tagName.toLowerCase() === 'input') {
            window.setTimeout(function(el) {
                el.setSelectionRange(0, el.value.length);
            }.bind(null, e.target), 10);
        }
    };

    mk.infoMessage = function(id, isAutoHide) {
        var el = document.getElementById(id);

        var hide = function(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            el.style.display = 'none';
        };

        el.addEventListener('click', hide, false);
        el.addEventListener('touchend', hide, false);

        return {
            'show': function() {
                el.style.display = 'inline-block';
                if (isAutoHide) {
                    window.setTimeout(function() {
                        el.style.display = 'none';
                    }, 2000);
                }
            },
            'hide': hide
        };
    };

}(window));
