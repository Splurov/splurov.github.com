(function() {

    'use strict';

    var mk = {};

    if (typeof exports !== 'undefined') {
        exports.mk = mk;
    }

    if (typeof window !== 'undefined') {
        window.mk = mk;
    }

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

    mk.objectExtend = function(target, object) {
        if (!object) {
            return target;
        }

        var finalObject = target;
        mk.objectIterate(object, function(key, value) {
            if (Object.prototype.toString.call(value) === '[object Object]') {
                finalObject[key] = mk.objectCopy(value);
            } else {
                finalObject[key] = value;
            }
        });

        return finalObject;
    };

    mk.numberFormat = function(n) {
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    mk.convertToTitle = function(s) {
        return s.replace('_', ' ').replace(/-/g, '.');
    };

    mk.getFormattedTime = function(time, hideSeconds) {
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

        this.getLength = function() {
            return this.entries.length;
        };

        entries.forEach(this.insert.bind(this));
    };

    mk.addEvents = function(el, eventNames, handler) {
        eventNames.forEach(function(eventName) {
            el.addEventListener(eventName, handler, false);
        });
    };

    mk.getAllByClass = function(cssClass, customContext) {
        return mk.toArray((customContext || document).getElementsByClassName(cssClass));
    };

    mk.selectAll = function(e) {
        if (['input', 'textarea'].indexOf(e.currentTarget.tagName.toLowerCase()) !== -1) {
            setTimeout(function(el) {
                el.setSelectionRange(0, el.value.length);
            }.bind(null, e.currentTarget), 10);
        }
    };

    mk.infoMessage = function(id, isAutoHide) {
        var el = document.getElementById(id);

        var timeout;

        var hide = function(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            clearTimeout(timeout);
            el.style.display = 'none';
        };

        mk.addEvents(el, ['click', 'touchend'], hide);

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
    };

    mk.getTopPosition = function(el) {
        var position = 0;
        do {
            position += el.offsetTop;
        } while (el = el.offsetParent);

        return position;
    };

    mk.Events = {

        events: {},
        future: {},

        trigger: function(name, data, future) {
            if (this.events[name]) {
                this.events[name].forEach(function(event) {
                    event(data);
                });
            } else if (future) {
                if (!this.future[name]) {
                    this.future[name] = [];
                }
                this.future[name].push(data || {});
            }
        },

        listen: function(name, cb) {
            if (!this.events[name]) {
                this.events[name] = [];
            }
            this.events[name].push(cb);

            if (this.future[name]) {
                this.future[name].forEach(function(data) {
                    cb(data);
                });
            }
        }

    };

}());
