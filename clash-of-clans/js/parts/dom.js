part('dom', function() {
    'use strict';

    var registerUniversalClick = function(target, listener) {
        var touchSupported = ('ontouchstart' in window);

        var lastEventSource;

        if (touchSupported) {
            var tapping;

            target.addEventListener('touchstart', function() {
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
            target.addEventListener('click', function(e) {
                if (lastEventSource === 'touch') {
                    lastEventSource = null;
                } else {
                    lastEventSource = 'mouse';
                    listener(e);
                }
            }, false);
        }

    };

    var listen = function(target, type, listener) {
        if (type === 'universalClick') {
            registerUniversalClick(target, listener);
        } else if (type === 'transitionend') {
            ['transitionend', 'webkitTransitionEnd'].forEach(function(eventName) {
                target.addEventListener(eventName, listener, false);
            });
        } else if (type === 'animationend') {
            ['animationend', 'webkitAnimationEnd', 'MSAnimationEnd'].forEach(function(eventName) {
                target.addEventListener(eventName, listener, false);
            });
        } else {
            target.addEventListener(type, listener);
        }
    };

    var toggleClass = function(el, value, state) {
        el.classList[state ? 'add' : 'remove'](value);
    };

    var List = function(elements) {
        if (elements) {
            this.elements = elements;
        } else {
            this.elements = [];
        }

        this.iterate = function(callback) {
            var i = -1;
            var l = this.elements.length;
            while (++i < l) {
                callback(this.elements[i]);
            }
        };

        this.toggleClass = function(value, state) {
            this.iterate(function(el) {
                toggleClass(el, value, state);
            });
        };

        this.listen = function(type, listener) {
            this.iterate(function(el) {
                listen(el, type, listener);
            });
        };
    };

    var selectAllTimeout;
    var selectAll = function(e) {
        var el = e.target;
        if ('setSelectionRange' in el && el.value !== '') {
            clearTimeout(selectAllTimeout);
            selectAllTimeout = setTimeout(function() {
                el.setSelectionRange(0, el.value.length);
            }, 0);
        }
    };

    var byIdCache = {};
    var byId = function(id) {
        if (!byIdCache[id]) {
            byIdCache[id] = document.getElementById(id);
        }
        return byIdCache[id];
    };

    var updater = (function() {
        var current = {};
        var deferred = {};

        var types = {
            'text': function(el, value) {
                el.textContent = value;
            },
            'html': function(el, value) {
                el.innerHTML = value;
            },
            'display': function(el, value) {
                el.style.display = value;
            }
        };

        var update = function(id, type, value) {
            if (!current[id]) {
                current[id] = {
                    'type': null,
                    'value': null
                };
            }

            var currentItem = current[id];

            if (currentItem.type !== type || currentItem.value !== type) {
                currentItem.type = type;
                currentItem.value = value;

                types[type](byId(id), value);
            }
        };

        var updateAll = function() {
            Object.keys(deferred).forEach(function(id) {
                update(id, deferred[id].type, deferred[id].value);
            });
            deferred = {};
        };

        return {
            'defer': function(id, type, value) {
                deferred[id] = {
                    'type': type,
                    'value': value
                };
            },
            'runDeferred': function() {
                updateAll();
            },
            'instantly': update
        };
    }());

    return {
        'id': byId,
        'find': function(selector, context) {
            return new List((context || document).querySelectorAll(selector));
        },
        'selectOnFocus': function(el) {
            listen(el, 'focus', selectAll);
        },
        'toggleClass': toggleClass,
        'updater': updater,

        'listen': listen,
        'trigger': function(el, type) {
            var event = document.createEvent('HTMLEvents');
            event.initEvent(type, true, false);
            el.dispatchEvent(event);
        },

        'listenCustom': function(type, listener) {
            listen(window, type, function(e) {
                listener(e.detail);
            });
        },
        'triggerCustom': function(type, data) {
            var event = document.createEvent('CustomEvent');
            event.initCustomEvent(type, false, false, (data || {}));
            window.dispatchEvent(event);
        }
    };

});
