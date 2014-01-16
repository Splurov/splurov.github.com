part('dom', function() {
    'use strict';

    var RegisterUniversalClick = function(target, listener, isMiddleClickTriggers) {
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

    var listen = function(target, types, listener) {
        var l = types.length;
        while (l--) {
            var type = types[l];
            if (type === 'universalClick') {
                RegisterUniversalClick(target, listener);
            } else if (type === 'universalAndMiddleClick') {
                RegisterUniversalClick(target, listener, true);
            } else {
                target.addEventListener(type, listener, false);
            }
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

        this.listen = function(types, listener) {
            this.iterate(function(el) {
                listen(el, types, listener);
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
                toggleClass(el, value, state);
            });
        };
    };

    var selectAllTimeout;
    var selectAll = function(e) {
        var el = e.currentTarget;
        if (['input', 'textarea'].indexOf(el.tagName.toLowerCase()) !== -1 && el.value !== '') {
            clearTimeout(selectAllTimeout);
            selectAllTimeout = setTimeout(function() {
                el.setSelectionRange(0, el.value.length);
            }, 1);
        }
    };

    return {
        'id': function(id) {
            return document.getElementById(id);
        },
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
            listen(el, ['focus'], selectAll);
        },
        'listen': listen,
        'toggleClass': toggleClass
    };

});
