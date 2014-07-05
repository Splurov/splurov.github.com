part([
    'dom'
], function(dom) {

    'use strict';

    var spinnerAction = function(el, type) {
        var current = parseInt(el.value, 10);
        if (type === '+') {
            if (isNaN(current)) {
                el.value = 1;
            } else {
                el.value = ++current;
            }
        } else {
            if (isNaN(current) || current <= 1) {
                el.value = '';
            } else {
                el.value = --current;
            }
        }
        dom.trigger(el, 'input');
    };


    var ActiveItem = function(touch) {
        var self = this;

        this.target = touch.target;
        this.click = true;
        this.x = touch.screenX;
        this.y = touch.screenY;

        this.firstTimeout = setTimeout(function() {
            self.click = false;
            (function fakeInterval() {
                self.secondTimeout = setTimeout(function() {
                    self.allowPrevent = true;
                    self.run();
                    fakeInterval();
                }, 100);
            }());
        }, 300);

    };

    ActiveItem.prototype.run = function() {
        var targetEl = dom.id(this.target.getAttribute('data-for'));
        spinnerAction(targetEl, this.target.textContent);
    };

    ActiveItem.prototype.isMoved = function(touch, divisor) {
        var diffX = Math.abs(touch.screenX - this.x) / divisor;
        var diffY = Math.abs(touch.screenY - this.y) / divisor;

        if (diffX > 16 || diffY > 16) {
            return true;
        }

        return false;
    };

    ActiveItem.prototype.destroy = function() {
        this.target = null;
        clearTimeout(this.firstTimeout);
        clearTimeout(this.secondTimeout);
    };


    var activeItems = {
        'items': {},
        'start': function(touches) {
            var isFirst = false;

            for (var i = 0, l = touches.length; i < l; i++) {
                var touch = touches[i];

                if (touch.target.classList.contains('js-spinner')) {
                    if (Object.keys(this.items).length === 0) {
                        isFirst = true;
                    }

                    this.items[touch.identifier] = new ActiveItem(touch);
                }
            }

            return isFirst;
        },
        'move': function(touches, divisor) {
            divisor = divisor || 1;

            var isPrevent = false;

            for (var i = 0, l = touches.length; i < l; i++) {
                var touch = touches[i];

                if (touch.identifier in this.items) {
                    this.items[touch.identifier].click = false;

                    if (this.items[touch.identifier].isMoved(touch, divisor)) {
                        this.items[touch.identifier].destroy();
                        delete this.items[touch.identifier];
                    } else if (this.items[touch.identifier].allowPrevent) {
                        isPrevent = true;
                    }
                }
            }

            return isPrevent;
        },
        'end': function(touches) {
            for (var i = 0, l = touches.length; i < l; i++) {
                var touch = touches[i];

                if (touch.identifier in this.items) {
                    if (this.items[touch.identifier].click) {
                        this.items[touch.identifier].run();
                    }
                    this.items[touch.identifier].destroy();
                    delete this.items[touch.identifier];
                }
            }
        }
    };


    if (window.mkSupport.touch) {
        var preventTimeStamp = 0;
        dom.listen(document.body, 'touchstart', function(e) {
            if (activeItems.start(e.changedTouches)) {
                if (e.timeStamp - preventTimeStamp <= 300) {
                    e.preventDefault();
                }
                preventTimeStamp = e.timeStamp;
            }
        });

        dom.listen(document.body, 'touchmove', function(e) {
            if (activeItems.move(e.changedTouches, 2)) {
                e.preventDefault();
            }
        });

        ['touchend', 'touchcancel'].forEach(function(eventName) {
            dom.listen(document.body, eventName, function(e) {
                activeItems.end(e.changedTouches);
            });
        });
    } else {
        dom.listen(document.body, 'mousedown', function(e) {
            e.identifier = 'mouse';
            activeItems.start([e]);
        });

        dom.listen(document.body, 'mousemove', function(e) {
            e.identifier = 'mouse';
            activeItems.move([e]);
        });

        dom.listen(document.body, 'mouseup', function(e) {
            e.identifier = 'mouse';
            activeItems.end([e]);
        });
    }

    dom.listen(document.body, 'keydown', function(e) {
        if (e.target.classList.contains('js-number') && !e.metaKey && !e.shiftKey && !e.ctrlKey && !e.altKey &&
                [38, 40].indexOf(e.keyCode) !== -1) {
            spinnerAction(e.target, (e.keyCode === 38 ? '+' : '-'));
            e.preventDefault();
        }
    });

    dom.find('.js-number').iterate(dom.selectOnFocus);

});