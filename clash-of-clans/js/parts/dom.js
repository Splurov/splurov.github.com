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
        } else {
            target.addEventListener(type, listener, false);
        }
    };

    var clickHandlers = {};
    var middleClickHandlers = {};

    var getSuitableClassNames = function(el, handlers) {
        return Object.keys(handlers).filter(function(className) {
            return el.classList.contains(className);
        });
    };

    var processSuitableHandlers = function(e, suitable, handlers) {
        var newSuitable = getSuitableClassNames(e.target, clickHandlers);
        if (!newSuitable.length) {
            return;
        }

        var classNames = newSuitable.filter(function(className) {
            return suitable.indexOf(className) !== -1;
        });
        if (!classNames.length) {
            return;
        }

        classNames.forEach(function(className) {
            handlers[className](e);
        });
    };

    var touchSupported = ('ontouchstart' in window);

    var lastEventSource;

    if (touchSupported) {
        var tapSuitable;

        listen(document.body, 'touchstart', function(e) {
            if (lastEventSource === 'mouse') {
                lastEventSource = null;
            } else {
                tapSuitable = getSuitableClassNames(e.target, clickHandlers);
                lastEventSource = 'touch';
            }
        });

        listen(document.body, 'touchmove', function() {
            tapSuitable = null;
        });

        listen(document.body, 'touchcancel', function() {
            tapSuitable = null;
        });

        listen(document.body, 'touchend', function(e) {
            if (tapSuitable && tapSuitable.length) {
                processSuitableHandlers(e, tapSuitable, clickHandlers);
            }
        });
    }

    if (!window.mkIsMobile || !touchSupported) {
        var middleClickSuitable;

        listen(document.body, 'mousedown', function(e) {
            if (lastEventSource === 'touch') {
                lastEventSource = null;
            } else {
                lastEventSource = 'mouse';
                middleClickSuitable = getSuitableClassNames(e.target, middleClickHandlers);
            }
        });

        listen(document.body, 'mousemove', function() {
            middleClickSuitable = null;
        });

        listen(document.body, 'mouseup', function(e) {
            if (e.which === 2 && middleClickSuitable && middleClickSuitable.length) {
                processSuitableHandlers(e, middleClickSuitable, middleClickHandlers);
            }
        });

        listen(document.body, 'click', function(e) {
            if (lastEventSource === 'touch') {
                lastEventSource = null;
            } else {
                Object.keys(clickHandlers).forEach(function(className) {
                    if (e.target.classList.contains(className)) {
                        clickHandlers[className](e);
                    }
                });

                lastEventSource = 'mouse';
            }
        });
    }

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

    var byId = function(id) {
        return document.getElementById(id);
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
                    'el': byId(id),
                    'type': null,
                    'value': null
                };
            }

            var currentItem = current[id];

            if (currentItem.type !== type || currentItem.value !== type) {
                currentItem.type = type;
                currentItem.value = value;

                types[type](currentItem.el, value);
            }
        };

        return {
            'defer': function(id, type, value) {
                deferred[id] = {
                    'type': type,
                    'value': value
                };
            },
            'runDeferred': function() {
                Object.keys(deferred).forEach(function(id) {
                    update(id, deferred[id].type, deferred[id].value);
                });
                deferred = {};
            },
            'instantly': update
        };
    }());

    return {
        'id': byId,
        'insertBefore': function(el, newEl) {
            if (el.nextSibling) {
                el.parentNode.insertBefore(newEl, el.nextSibling);
            } else {
                el.parentNode.appendChild(newEl);
            }
        },
        'find': function(selector, context) {
            return new List((context || document).querySelectorAll(selector));
        },
        'selectOnFocus': function(el) {
            listen(el, 'focus', selectAll);
        },
        'registerUniversalClickHandler': function(className, handler) {
            clickHandlers[className] = handler;
        },
        'registerUniversalClickAndMiddleClickHandler': function(className, handler) {
            clickHandlers[className] = handler;
            middleClickHandlers[className] = handler;
        },
        'listen': listen,
        'toggleClass': toggleClass,
        'updater': updater
    };

});
