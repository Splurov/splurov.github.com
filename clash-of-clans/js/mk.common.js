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

    var selectAllTimeout;
    mk.selectAll = function(e) {
        var el = e.currentTarget;
        if (['input', 'textarea'].indexOf(el.tagName.toLowerCase()) !== -1 && el.value !== '') {
            clearTimeout(selectAllTimeout);
            selectAllTimeout = setTimeout(function() {
                el.setSelectionRange(0, el.value.length);
            }, 1);
        }
    };

    var $RegisterUniversalClick = function(target, listener, isMiddleClickTriggers) {
        var touchSupported = ('ontouchstart' in window);

        var lastEventSource;

        if (touchSupported) {
            var tapping;

            target.addEventListener('touchstart', function(e) {
                if (lastEventSource === 'mouse') {
                    lastEventSource = null;
                    tapping = false;
                } else {
                    lastEventSource = 'touch';
                    tapping = true;
                }
            }, false);

            target.addEventListener('touchmove', function() {
                tapping = false;
            }, false);

            target.addEventListener('touchcancel', function() {
                tapping = false;
            }, false);

            target.addEventListener('touchend', function(e) {
                if (tapping) {
                    listener(e);
                }
            }, false);
        }

        if (!window.mkIsMobile || !touchSupported) {
            if (isMiddleClickTriggers) {
                var clicking;

                target.addEventListener('mousedown', function() {
                    if (lastEventSource === 'touch') {
                        lastEventSource = null;
                        clicking = false;
                    } else {
                        lastEventSource = 'mouse';
                        clicking = true;
                    }
                }, false);

                target.addEventListener('mousemove', function() {
                    clicking = false;
                }, false);

                target.addEventListener('mouseup', function(e) {
                    if (clicking && e.which !== 3) {
                        listener(e);
                    }
                }, false);

                target.addEventListener('keypress', function(e) {
                    var code = e.keyCode || e.which;
                    if ([13, 32].indexOf(code) !== -1) {
                        listener(e);
                    }
                }, false);

            } else {
                target.addEventListener('click', function(e) {
                    if (lastEventSource === 'touch') {
                        lastEventSource = null;
                    } else {
                        lastEventSource = 'mouse';
                        listener(e);
                    }
                }, false);
            }
        }

    };

    mk.$Listen = function(target, types, listener) {
        var l = types.length;
        while (l--) {
            var type = types[l];
            if (type === 'universalClick') {
                $RegisterUniversalClick(target, listener);
            } else if (type === 'universalAndMiddleClick') {
                $RegisterUniversalClick(target, listener, true);
            } else {
                target.addEventListener(type, listener, false);
            }
        }
    };

    mk.$toggleClass = function(el, value, state) {
        el.classList[state ? 'add' : 'remove'](value);
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

        this.toggleClass = function(value, state) {
            this.iterate(function(el) {
                mk.$toggleClass(el, value, state);
            });
        };
    };


    mk.$ = function(selector, context) {
        return new $List((context || document).querySelectorAll(selector));
    };

    mk.$id = function(id) {
        return document.getElementById(id);
    };

    mk.$insertBefore = function(el, newEl) {
        if (el.nextSibling) {
            el.parentNode.insertBefore(newEl, el.nextSibling);
        } else {
            el.parentNode.appendChild(newEl);
        }
    };

    mk.infoMessage = function(id, isAutoHide) {
        var el = mk.$id(id);

        var timeout;

        var hide = function() {
            clearTimeout(timeout);
            el.style.display = 'none';
        };

        mk.$Listen(el, ['universalClick'], hide);

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
