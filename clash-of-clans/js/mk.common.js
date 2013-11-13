(function(global) {

    'use strict';

    var mk = {};
    global.mk = mk;

    if (!Function.prototype.bind) {
        Function.prototype.bind = function(context) {
            var self = this;
            var args = Array.prototype.slice.call(arguments, 1);
            return function() {
                return self.apply(context, args.concat(Array.prototype.slice.call(arguments)));
            };
        };
    }

    mk.objectIterate = function(obj, callback) {
        for (var key in obj) {
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

    mk.selectAll = function(e) {
        if (['input', 'textarea'].indexOf(e.currentTarget.tagName.toLowerCase()) !== -1) {
            setTimeout(function(el) {
                el.setSelectionRange(0, el.value.length);
            }.bind(null, e.currentTarget), 10);
        }
    };

    var $RegisterMobileClick = function(target) {
        if (window.Touch && !target.__clickRegistered) {
            var moved;

            target.addEventListener('touchstart', function(e) {
                e.preventDefault();
                moved = false;
            }, false);

            target.addEventListener('touchmove', function() {
                moved = true;
            }, false);

            target.addEventListener('touchend', function(e) {
                if (!moved) {
                    var ev = document.createEvent('MouseEvents');
                    ev.initEvent('click', true, true);
                    e.currentTarget.dispatchEvent(ev);
                }
            }, false);

            target.__clickRegistered = true;
        }
    };

    mk.$Listen = function(target, types, listener) {
        var i = -1;
        var l = types.length;
        while (++i < l) {
            var type = types[i];
            if (type === 'click') {
                $RegisterMobileClick(target, listener);
            }
            target.addEventListener(type, listener, false);
        }
    };

    var $List = function(elements) {
        if (elements) {
            this.elements = elements;
        } else {
            this.elements = [];
        }

        this.listen = function(types, listener) {
            this.iterate(function(el) {
                mk.$Listen(el, types, listener);
            });
        };

        this.iterate = function(callback) {
            var i = -1;
            var l = this.elements.length;
            while (++i < l) {
                callback(this.elements[i]);
            }
        };
    };


    mk.$ = function(selector, context) {
        return new $List((context || document).querySelectorAll(selector));
    };

    mk.$id = function(id) {
        return document.getElementById(id);
    };

    mk.infoMessage = function(id, isAutoHide) {
        var el = mk.$id(id);

        var timeout;

        var hide = function() {
            clearTimeout(timeout);
            el.style.display = 'none';
        };

        mk.$Listen(el, ['click'], hide);

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

}(typeof exports !== 'undefined' ? exports : window));
