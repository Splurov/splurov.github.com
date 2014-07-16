/**
* @preserve Copyright 2012 Twitter, Inc.
* @license http://www.apache.org/licenses/LICENSE-2.0.txt
*/
var Hogan={};!function(t){function i(t,i,s){var e;return i&&"object"==typeof i&&(void 0!==i[t]?e=i[t]:s&&i.get&&"function"==typeof i.get&&(e=i.get(t))),e}function s(t,i,s,e,n,r){function o(){}function u(){}o.prototype=t,u.prototype=t.subs;var a,c=new o;c.subs=new u,c.subsText={},c.buf="",e=e||{},c.stackSubs=e,c.subsText=r;for(a in i)e[a]||(e[a]=i[a]);for(a in e)c.subs[a]=e[a];n=n||{},c.stackPartials=n;for(a in s)n[a]||(n[a]=s[a]);for(a in n)c.partials[a]=n[a];return c}function e(t){return String(null===t||void 0===t?"":t)}function n(t){return t=e(t),h.test(t)?t.replace(r,"&amp;").replace(o,"&lt;").replace(u,"&gt;").replace(a,"&#39;").replace(c,"&quot;"):t}t.Template=function(t,i,s,e){t=t||{},this.r=t.code||this.r,this.c=s,this.options=e||{},this.text=i||"",this.partials=t.partials||{},this.subs=t.subs||{},this.buf=""},t.Template.prototype={r:function(){return""},v:n,t:e,render:function(t,i,s){return this.ri([t],i||{},s)},ri:function(t,i,s){return this.r(t,i,s)},ep:function(t,i){var e=this.partials[t],n=i[e.name];if(e.instance&&e.base==n)return e.instance;if("string"==typeof n){if(!this.c)throw new Error("No compiler available.");n=this.c.compile(n,this.options)}if(!n)return null;if(this.partials[t].base=n,e.subs){i.stackText||(i.stackText={});for(key in e.subs)i.stackText[key]||(i.stackText[key]=void 0!==this.activeSub&&i.stackText[this.activeSub]?i.stackText[this.activeSub]:this.text);n=s(n,e.subs,e.partials,this.stackSubs,this.stackPartials,i.stackText)}return this.partials[t].instance=n,n},rp:function(t,i,s,e){var n=this.ep(t,s);return n?n.ri(i,s,e):""},rs:function(t,i,s){var e=t[t.length-1];if(!f(e))return void s(t,i,this);for(var n=0;n<e.length;n++)t.push(e[n]),s(t,i,this),t.pop()},s:function(t,i,s,e,n,r,o){var u;return f(t)&&0===t.length?!1:("function"==typeof t&&(t=this.ms(t,i,s,e,n,r,o)),u=!!t,!e&&u&&i&&i.push("object"==typeof t?t:i[i.length-1]),u)},d:function(t,s,e,n){var r,o=t.split("."),u=this.f(o[0],s,e,n),a=this.options.modelGet,c=null;if("."===t&&f(s[s.length-2]))u=s[s.length-1];else for(var h=1;h<o.length;h++)r=i(o[h],u,a),void 0!==r?(c=u,u=r):u="";return n&&!u?!1:(n||"function"!=typeof u||(s.push(c),u=this.mv(u,s,e),s.pop()),u)},f:function(t,s,e,n){for(var r=!1,o=null,u=!1,a=this.options.modelGet,c=s.length-1;c>=0;c--)if(o=s[c],r=i(t,o,a),void 0!==r){u=!0;break}return u?(n||"function"!=typeof r||(r=this.mv(r,s,e)),r):n?!1:""},ls:function(t,i,s,n,r){var o=this.options.delimiters;return this.options.delimiters=r,this.b(this.ct(e(t.call(i,n)),i,s)),this.options.delimiters=o,!1},ct:function(t,i,s){if(this.options.disableLambda)throw new Error("Lambda features disabled.");return this.c.compile(t,this.options).render(i,s)},b:function(t){this.buf+=t},fl:function(){var t=this.buf;return this.buf="",t},ms:function(t,i,s,e,n,r,o){var u,a=i[i.length-1],c=t.call(a);return"function"==typeof c?e?!0:(u=this.activeSub&&this.subsText&&this.subsText[this.activeSub]?this.subsText[this.activeSub]:this.text,this.ls(c,a,s,u.substring(n,r),o)):c},mv:function(t,i,s){var n=i[i.length-1],r=t.call(n);return"function"==typeof r?this.ct(e(r.call(n)),n,s):r},sub:function(t,i,s,e){var n=this.subs[t];n&&(this.activeSub=t,n(i,s,this,e),this.activeSub=!1)}};var r=/&/g,o=/</g,u=/>/g,a=/\'/g,c=/\"/g,h=/[&<>\"\']/,f=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)}}("undefined"!=typeof exports?exports:Hogan);

// Copyright 2014 Mikhail Kalashnik

var part = (function() {
    'use strict';

    var postponed = [];

    var parts = {};

    var buildDeps = function(deps) {
        return deps.map(function(dep) {
            return parts[dep];
        });
    };

    var isDomReady;
    if (typeof window !== 'undefined') {
        isDomReady = window.MK_DOM_CONTENT_LOADED;
        document.addEventListener('DOMContentLoaded', function() {
            isDomReady = true;
            while (postponed.length) {
                var fn = postponed.shift();
                fn();
            }
        }, false);
    } else {
        isDomReady = true;
    }

    return function(nameOrDeps, depsOrFunc, func) {
        var fn = function() {
            if (typeof nameOrDeps === 'string') {
                parts[nameOrDeps] = func ? func.apply(null, buildDeps(depsOrFunc)) : depsOrFunc();
            } else {
                depsOrFunc.apply(null, buildDeps(nameOrDeps));
            }
        };

        if (isDomReady) {
            fn();
        } else {
            postponed.push(fn);
        }
    };
}());



part('dom', function() {
    'use strict';

    var registerUniversalClick = function(target, listener) {
        if (window.mkSupport.touch) {
            var tapping;

            target.addEventListener('touchstart', function() {
                tapping = true;
            }, false);

            target.addEventListener('touchmove', function() {
                tapping = false;
            }, false);

            target.addEventListener('touchcancel', function() {
                tapping = false;
            }, false);

            target.addEventListener('touchend', function(e) {
                e.preventDefault();
                if (tapping) {
                    listener(e);
                }
            }, false);
        }

        target.addEventListener('click', function(e) {
            listener(e);
        }, false);
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

            if (currentItem.type !== type || currentItem.value !== value) {
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

    var findCache = {};

    return {
        'id': byId,
        'find': function(selector, context) {
            return new List((context || document).querySelectorAll(selector));
        },
        'findCache': function(selector) {
            if (!findCache[selector]) {
                findCache[selector] = this.find(selector);
            }

            return findCache[selector];
        },
        'selectOnFocus': function(el, callback) {
            listen(el, 'focus', function(e) {
                selectAll(e);
                if (callback) {
                    callback();
                }
            });
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
        },

        'getPosition': function(el) {
            var topPosition = 0;
            var leftPosition = 0;
            do {
                topPosition += el.offsetTop;
                leftPosition += el.offsetLeft;
            } while (el = el.offsetParent);

            return {'top': topPosition, 'left': leftPosition};
        }
    };

});

part('goal', [
    'dom'
], function(dom) {

    'use strict';

    var sent = [];
    var beforeReady = {};

    var metrikaReady = false;
    var windowReady = true;

    var metrika;

    var isReady = function() {
        return metrikaReady && windowReady;
    };

    var send = function(target, params) {
        metrika.reachGoal(target, params);
    };

    var runIfReady = function() {
        if (isReady()) {
            Object.keys(beforeReady).forEach(function(target) {
                send(target, beforeReady[target]);
            });
        }
    };

    dom.listen(window, 'load', function() {
        windowReady = true;

        runIfReady();
    });

    window.yandexMetrikaLoadCallback = function(yandexMetrika) {
        metrikaReady = true;
        metrika = yandexMetrika;

        runIfReady();
    };

    var reach = function(target, rawParams) {
        if (sent.indexOf(target) !== -1) {
            return;
        }
        sent.push(target);

        var params = rawParams || null;

        if (isReady()) {
            send(target, params);
        } else {
            beforeReady[target] = params;
        }
    };

    return {
        'reach': reach
    };

});

part('smoothScroll', [
    'dom',
    'goal'
], function(dom){

    'use strict';

    var globalScrollOffset = parseInt(window.getComputedStyle(document.body).getPropertyValue('padding-top'), 10);

    var smoothScroll = function(el, callback) {
        var currentScrollTop = window.pageYOffset;
        var elScrollTop = Math.max(dom.getPosition(el).top - globalScrollOffset, 0);

        var toTop = (elScrollTop < currentScrollTop);
        var diff = (toTop ? (currentScrollTop - elScrollTop) : (elScrollTop - currentScrollTop));

        var duration = 100 + (diff / 20);
        var delay = 16;
        var step = Math.ceil(diff / (duration / delay));

        if (step === 0) {
            return;
        }

        (function scrollIteration() {
            setTimeout(function() {
                if (toTop) {
                    currentScrollTop -= step;
                    if (currentScrollTop < elScrollTop) {
                        currentScrollTop = elScrollTop;
                    }
                } else {
                    currentScrollTop += step;
                    if (currentScrollTop > elScrollTop) {
                        currentScrollTop = elScrollTop;
                    }
                }

                window.scrollTo(window.pageXOffset, currentScrollTop);

                if (currentScrollTop !== elScrollTop) {
                    scrollIteration();
                } else if (callback) {
                    callback();
                }
            }, delay);
        }());
    };

    return {
        'scrollTo': smoothScroll
    };

});

part('localStorageSet', [
    'dom',
    'goal',
    'smoothScroll'
], function(dom, goal, smoothScroll) {
    'use strict';

    var localStorageKnownKeys = [
        'data5',
        'light-boosted-1',
        'light-boosted-2',
        'light-boosted-3',
        'light-boosted-4',
        'dark-boosted-1',
        'dark-boosted-2',
        'spells-boosted',
        'light-view',
        'dark-view'
    ];

    var memoryMessageId = 'storage-quota-exceeded';
    var memoryMessageEl = dom.id(memoryMessageId);
    return function(key, value, favoritesCount) {
        if (typeof favoritesCount === 'undefined') {
            favoritesCount = -2;
        }

        var message;
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            goal.reach('QUOTA_EXCEEDED', {'quotaExceededFavoritesCount': favoritesCount.toString()});

            var tempData = {};
            localStorageKnownKeys.forEach(function(backupKey) {
                tempData[backupKey] = localStorage.getItem(backupKey);
            });
            localStorage.clear();
            Object.keys(tempData).forEach(function(backupKey) {
                if (tempData[backupKey]) {
                    localStorage.setItem(backupKey, tempData[backupKey]);
                }
            });
            tempData = null;

            try {
                localStorage.setItem(key, value);
            } catch (e) {
                if (favoritesCount > 0) {
                    goal.reach('QUOTA_EXCEEDED_AGAIN', {'quotaExceededAgainFavoritesCount': favoritesCount.toString()});
                    message = '<strong>Attention!</strong> Looks like we have exceeded the quota' +
                              ' to store Clash Calc data. Please remove unused army compositions from favorites.';
                } else {
                    var dataLength = -1;
                    var data = localStorage.getItem(localStorageKnownKeys[0]);
                    if (data) {
                        dataLength = data.length;
                    }

                    if (dataLength === -1 && navigator.userAgent.indexOf('Safari') !== -1) {
                        message = 'Looks like you are using private mode of the Safari browser, so it’s not possible' +
                                  ' to store Clash Calc data. Please turn off private mode if you want to preserve data' +
                                  ' between visits.';
                        dataLength = -2;
                    } else {
                        message = '<strong>Attention!</strong> Looks like we have exceeded the quota' +
                                  ' to store Clash Calc data.' +
                                  ' Normally this shouldn’t have happened.' +
                                  ' Perhaps your browser is configured in a special way.' +
                                  ' To fix the problem please check the settings related to the Local Storage.';
                    }

                    goal.reach('QUOTA_EXCEEDED_UNKNOWN', {'quotaExceededDataLength': dataLength.toString()});
                }
            }
        }

        if (message) {
            dom.updater.instantly(memoryMessageId, 'html', message);
            dom.updater.instantly(memoryMessageId, 'display', '');
            smoothScroll.scrollTo(memoryMessageEl);

            return false;
        } else {
            dom.updater.instantly(memoryMessageId, 'display', 'none');

            return true;
        }
    };
});



part('common', function() {

    'use strict';

    return {
        'objectCopy': function objectCopy(obj) {
            if (obj === null || typeof obj !== 'object') {
                return obj;
            }

            var newObj = obj.constructor();
            Object.keys(obj).forEach(function(key) {
                newObj[key] = objectCopy(obj[key]);
            });

            return newObj;
        },

        'numberFormat': function(n) {
            return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },

        'convertToTitle': function(s) {
            var converted = s.replace('_', ' ').replace(/-/g, '.');
            if (converted[converted.length - 1] === '.') {
                return converted.slice(0, -1);
            }
            return converted;
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

part('converter', [
    'goal'
], function(goal) {

    'use strict';

    var oldConvert3to4 = function(data) {
        var subtractIndexes = [28,29,30,31,32,33,34,35,36,37,54,55,56,57,62];
        var settingsModeIndex = 63;

        var indexDiff = 0;
        subtractIndexes.forEach(function(keyIndex) {
            if (typeof data[keyIndex - indexDiff] !== 'undefined') {
                data.splice(keyIndex - indexDiff, 1);
                indexDiff++;
            }
        });
        if (typeof data[settingsModeIndex - indexDiff] !== 'undefined') {
            data.splice(settingsModeIndex - indexDiff, 1);
        }
    };

    var oldConvert4to5 = function(data) {
        var levelIndexes = [0,18,19,20,21,22,23,24,25,26,27,32,33,34,35,40,41,42,43,45,47];
        levelIndexes.forEach(function(keyIndex) {
            if (!data[keyIndex]) {
                data[keyIndex] = 0;
            }
            data[keyIndex]++;
        });
    };

    ['savedData', 'savedCalculations', 'data', 'data2', 'data3', 'data4', 'settingsMode'].forEach(function(key) {
        localStorage.removeItem(key);
    });

    return {
        'oldConvert3to4': oldConvert3to4,
        'oldConvert4to5': oldConvert4to5
    };

});



part('types', function() {
    'use strict';

    var data = {
        'light': {
            'Barbarian': [20, [0, 25, 40, 60, 80, 100, 150], 1, 1, {1: 1, 3: 2, 5: 3, 7: 4, 8: 5, 9: 6}],
            'Archer': [25, [0, 50, 80, 120, 160, 200, 300], 1, 2, {1: 1, 3: 2, 5: 3, 7: 4, 8: 5, 9: 6}],
            'Goblin': [30, [0, 25, 40, 60, 80, 100, 150], 1, 3, {1: 1, 3: 2, 5: 3, 7: 4, 8: 5, 10: 6}],
            'Giant': [120, [0, 500, 1000, 1500, 2000, 2500, 3000], 5, 4, {1: 1, 2: 1, 4: 2, 6: 3, 7: 4, 8: 5, 9: 6}],
            'Wall_Breaker': [120, [0, 1000, 1500, 2000, 2500, 3000, 3500], 2, 5, {1: 1, 3: 1, 4: 2, 6: 3, 7: 4, 8: 5, 10: 6}],
            'Balloon': [480, [0, 2000, 2500, 3000, 3500, 4000, 4500], 5, 6, {1: 1, 4: 2, 6: 3, 7: 4, 8: 5, 9: 6}],
            'Wizard': [480, [0, 1500, 2000, 2500, 3000, 3500, 4000], 4, 7, {1: 1, 5: 2, 6: 3, 7: 4, 8: 5, 10: 6}],
            'Healer': [900, [0, 5000, 6000, 8000, 10000], 14, 8, {1: 1, 6: 1, 7: 2, 8: 3, 9: 4}],
            'Dragon': [1800, [0, 25000, 30000, 36000, 42000], 20, 9, {1: 1, 7: 2, 8: 3, 10: 4}],
            'P-E-K-K-A-': [2700, [0, 30000, 35000, 40000, 45000, 50000], 25, 10, {1: 1, 8: 3, 10: 4}]
        },
        'dark': {
            'Minion': [45, [0, 6, 7, 8, 9, 10, 11], 2, 1, {1: 1, 7: 2, 8: 4, 9: 5, 10: 6}],
            'Hog_Rider': [120, [0, 40, 45, 52, 58, 65], 5, 2, {1: 1, 7: 2, 8: 4, 9: 5}],
            'Valkyrie': [900, [0, 70, 100, 130, 160], 8, 3, {1: 1, 7: 1, 8: 2, 9: 4}],
            'Golem': [2700, [0, 450, 525, 600, 675, 750], 30, 4, {1: 1, 8: 2, 9: 4, 10: 5}],
            'Witch': [1200, [0, 250, 350], 12, 5, {1: 1, 9: 2}]
        },
        'spells': {
            'Lightning': [1800, [0, 15000, 16500, 18000, 20000, 22000, 24000], 1, 1, {1: 1, 5: 4, 8: 5, 10: 6}],
            'Healing': [1800, [0, 15000, 16500, 18000, 20000, 22000, 24000], 1, 2, {1: 1, 6: 3, 7: 4, 8: 5, 9: 6}],
            'Rage': [2700, [0, 23000, 25000, 27000, 30000, 33000], 1, 3, {1: 1, 7: 4, 8: 5}],
            'Jump': [2700, [0, 23000, 29000, 31000], 1, 4, {1: 1, 9: 2, 10: 3}],
            'Freeze': [2700, [0, 26000, 29000, 31000, 33000, 35000], 1, 5, {1: 1, 10: 5}]
        }
    };

    return {
        'data': data,
        'iterateTree': function(callback) {
            Object.keys(data).forEach(function(type) {
                Object.keys(data[type]).forEach(function(name) {
                    callback(type, name, data[type][name]);
                });
            });
        },
        'buildings': {
            'light': {
                'count': 4,
                'queue': [0, 20, 25, 30, 35, 40, 45, 50, 55, 60, 75],
                'maxLevel': 10,
                'firstRequired': true,
                'th': {
                    1: [3, 0, 0, 0],
                    2: [4, 4, 0, 0],
                    3: [5, 5, 0, 0],
                    4: [6, 6, 6, 0],
                    5: [7, 7, 7, 0],
                    6: [8, 8, 8, 0],
                    7: [9, 9, 9, 9],
                    8: [10, 10, 10, 10]
                }
            },
            'dark': {
                'count': 2,
                'queue': [0, 40, 50, 60, 70, 80],
                'maxLevel': 5,
                'th': {
                    1: [0, 0],
                    7: [2, 0],
                    8: [4, 4],
                    9: [5, 5]
                }
            },
            'spells': {
                'max': 5
            }
        }
    };

});
part('storage', [
    'common',
    'localStorageSet'
], function(common, localStorageSet) {
    'use strict';

    var saveMappingKeys = [
        'light-level-1',
        'light-level-2',
        'light-level-3',
        'light-level-4',
        'dark-level-1',
        'dark-level-2',
        'army-camps',
        'spells-level',
        'Barbarian',
        'Archer',
        'Goblin',
        'Giant',
        'Wall_Breaker',
        'Balloon',
        'Wizard',
        'Healer',
        'Dragon',
        'P-E-K-K-A-',
        'Barbarian-level',
        'Archer-level',
        'Goblin-level',
        'Giant-level',
        'Wall_Breaker-level',
        'Balloon-level',
        'Wizard-level',
        'Healer-level',
        'Dragon-level',
        'P-E-K-K-A--level',
        'Lightning',
        'Healing',
        'Rage',
        'Jump',
        'Lightning-level',
        'Healing-level',
        'Rage-level',
        'Jump-level',
        'Minion',
        'Hog_Rider',
        'Valkyrie',
        'Golem',
        'Minion-level',
        'Hog_Rider-level',
        'Valkyrie-level',
        'Golem-level',
        'Freeze',
        'Freeze-level',
        'Witch',
        'Witch-level',
        'favorite-title'
    ];

    var excludeIndexes = [
        saveMappingKeys.indexOf('favorite-title')
    ];

    var dataObjectToArray = function(dataObject) {
        var dataArray = [];

        saveMappingKeys.forEach(function(key) {
            var value;
            if (dataObject.hasOwnProperty(key)) {
                value = dataObject[key];
            } else {
                value = null;
            }
            dataArray.push(value);
        });

        return dataArray;
    };

    var dataArrayToObject = function(dataArray) {
        var dataObject = {};

        saveMappingKeys.forEach(function(key, index) {
            if (dataArray[index] === undefined) {
                dataObject[key] = null;
            } else {
                dataObject[key] = dataArray[index];
            }
        });

        return dataObject;
    };

    var storageKey = 'data5';

    var load = function(isLoadSource) {
        var data = localStorage.getItem(storageKey);
        data = (data && JSON.parse(data)) || [];
        if (isLoadSource) {
            return data;
        }
        data = data.map(dataArrayToObject);
        return data;
    };

    var all = load().map(function(entry) {
        return new common.Dict(entry);
    });

    return {
        'getForDiff': function() {
            var source = load(true);
            excludeIndexes.forEach(function(index) {
                source.forEach(function(item) {
                    item[index] = null;
                });
            });
            return source;
        },
        'excludeIndexes': excludeIndexes,
        'all': all,
        'current': all[0] || new common.Dict({}),
        'save': function() {
            all[0] = this.current;
            var dataObjects = all.map(function(entry) {
                return entry.getAll();
            });

            var dataArrays = dataObjects.map(dataObjectToArray);
            return localStorageSet(storageKey, JSON.stringify(dataArrays), (all.length - 1));
        },
        'dataArrayToObject': dataArrayToObject,
        'dataObjectToArray': dataObjectToArray
    };
});
part([
    'types',
    'dom',
    'localStorageSet'
], function(types, dom, localStorageSet) {

    'use strict';

    if (!window.matchMedia('(max-width: 640px)').matches) {
        return;
    }

    var all = ['barrack', 'level', 'quantity', 'total', 'subtract'];
    var views = {
        'light': {
            'quantity': ['level', 'quantity', 'total'],
            'subtract': ['quantity', 'subtract'],
            'barrack': ['barrack']
        },
        'dark': {
            'quantity': ['level', 'quantity', 'total'],
            'subtract': ['quantity', 'subtract'],
            'barrack': ['quantity', 'barrack']
        }
    };

    var switchView = function(type, view) {
        localStorageSet(type + '-view', view);

        all.forEach(function(col) {
            var colElements = dom.findCache('.js-col-' + type + '-' + col);
            var isHide = (views[type][view].indexOf(col) === -1);
            colElements.iterate(function(colEl) {
                colEl.style.display = (isHide ? 'none' : '');
                dom.toggleClass(colEl, 'active', !isHide);
                colEl.classList.remove('data__last');
            });
        });

        dom.find('.data tr').iterate(function(row) {
            var cells = row.querySelectorAll('.active');
            if (cells.length) {
                cells[cells.length - 1].classList.add('data__last');
            }
        });

        Object.keys(views[type]).forEach(function(viewItem) {
            var viewItemEl = document.querySelector(
                    '.js-cols-switcher[data-type="' + type + '"][data-view="' + viewItem + '"]'
            );
            dom.toggleClass(viewItemEl, 'button_selected', (view === viewItem));
        });
    };

    dom.find('.js-cols-switcher').listen('universalClick', function(e) {
        switchView(e.currentTarget.getAttribute('data-type'), e.currentTarget.getAttribute('data-view'));
    });

    ['light', 'dark'].forEach(function(type) {
        switchView(type, (localStorage.getItem(type + '-view') || 'quantity'));
    });

});
part('calculate', [
    'storage',
    'types',
    'dom',
    'goal',
    'common'
], function(storage, types, dom, goal, common) {

    'use strict';

    var typesSorted = {};
    Object.keys(types.data).forEach(function(type) {
        typesSorted[type] = [];
        Object.keys(types.data[type]).forEach(function(name) {
            typesSorted[type].unshift(types.data[type][name].concat(name));
        });
    });
    typesSorted.dark.sort(function(a, b) {
        return b[2] - a[2];
    });

    var suitableBarracksSort = function(a, b) {
        // minimum time first
        var aTime = a.getActualTime();
        var bTime = b.getActualTime();
        if (aTime < bTime) {
            return -1;
        }
        if (aTime > bTime) {
            return 1;
        }

        // minimum space first
        if (a.space < b.space) {
            return -1;
        }
        if (a.space > b.space) {
            return 1;
        }

        // minimum max space first
        if (a.maxSpace < b.maxSpace) {
            return -1;
        }
        if (a.maxSpace > b.maxSpace) {
            return 1;
        }

        return 0;
    };


    var barracksMinLevelSort = function(a, b) {
        // minimum level first
        if (a.level < b.level) {
            return -1;
        }
        if (a.level > b.level) {
            return 1;
        }

        return suitableBarracksSort(a, b);
    };

    var getSuitableBarrack = function(barracksQueue,
                                      requiredLevel,
                                      requiredSpace,
                                      requiredTime,
                                      avgTime) {
        var suitable = barracksQueue.filter(function(barrack) {
            return barrack.level >= requiredLevel && (barrack.space + requiredSpace) <= barrack.maxSpace;
        });

        if (!suitable.length) {
            return null;
        }

        if (suitable.length > 1) {
            if (requiredSpace === 1) {
                var timeSuitable = suitable.filter(function(barrack) {
                    return (barrack.getActualTime() + requiredTime) <= avgTime;
                });
                if (timeSuitable.length) {
                    if (timeSuitable.length > 1) {
                        timeSuitable.sort(barracksMinLevelSort);
                    }
                    return timeSuitable[0];
                }
            }

            suitable.sort(suitableBarracksSort);
        }

        return suitable[0];
    };

    var fillBarracks = function(barracksQueue, unitsDistribution, avgTime, activeCount) {
        var isSuitedForEqual = true;

        var maxUnitLevel = 0;
        var totalUnitsSpace = 0;
        unitsDistribution.forEach(function(kit) {
            if (isSuitedForEqual && kit[1] % activeCount !== 0) {
                isSuitedForEqual = false;
            }

            maxUnitLevel = Math.max(kit[2], maxUnitLevel);
            totalUnitsSpace += kit[1] * kit[4];
        });

        var isAllBarracksSimilar = true;
        var totalBarracksSpace = 0;
        var barracksNums = [];
        barracksQueue.forEach(function(barrack) {
            if (barrack.level !== 0) {
                var boostedLikeFirst = (barrack.isBoosted === barracksQueue[0].isBoosted);
                if (isSuitedForEqual && !(barrack.level >= maxUnitLevel && boostedLikeFirst)) {
                    isSuitedForEqual = false;
                }

                if (isSuitedForEqual && (totalUnitsSpace / activeCount) > barrack.maxSpace) {
                    isSuitedForEqual = false;
                }

                if (isAllBarracksSimilar && !(barrack.level === barracksQueue[0].level && boostedLikeFirst)) {
                    isAllBarracksSimilar = false;
                }

                barracksNums.push(barrack.num);

                totalBarracksSpace += barrack.maxSpace;
            }
        });

        isSuitedForEqual = (isSuitedForEqual && totalBarracksSpace >= totalUnitsSpace);

        var stopDistribution = false;

        while (unitsDistribution.length) {
            var kit = unitsDistribution.shift();
            var kitIndex = kit[0];
            var kitQuantity = kit[1];
            var kitLevel = kit[2];
            var kitTime = kit[3];
            var kitSpace = kit[4];

            if (isSuitedForEqual) {
                var quantityPerBarrack = kitQuantity / activeCount;
                var timePerBarrack = quantityPerBarrack * kitTime;
                var spacePerBarrack = quantityPerBarrack * kitSpace;

                barracksQueue.forEach(function(barrack) {
                    if (barrack.level !== 0) {
                        barrack.units[kitIndex] = quantityPerBarrack;
                        barrack.time += timePerBarrack;
                        barrack.space += spacePerBarrack;
                    }
                });
            } else {
                var barrack = null;
                while (kitQuantity--) {
                    var isGetBarrack = true;
                    if (barrack) {
                        var newTime = barrack.getActualTime() + kitTime;
                        var newSpace = barrack.space + kitSpace;
                        if (kitSpace === 1 && newTime <= avgTime && newSpace <= barrack.maxSpace) {
                            isGetBarrack = false;
                        }
                    }

                    if (isGetBarrack) {
                        barrack = getSuitableBarrack(
                            barracksQueue,
                            kitLevel,
                            kitSpace,
                            kitTime,
                            avgTime
                        );
                    }

                    if (barrack === null) {
                        stopDistribution = true;
                        break;
                    }

                    if (barrack.units[kitIndex]) {
                        barrack.units[kitIndex]++;
                    } else {
                        barrack.units[kitIndex] = 1;
                    }

                    barrack.time += kitTime;
                    barrack.space += kitSpace;
                }
            }
        }

        if (!stopDistribution && isAllBarracksSimilar && !isSuitedForEqual) {
            barracksQueue.sort(function(a, b) {
                return b.getActualTime() - a.getActualTime();
            });
            barracksQueue.forEach(function(barrack, index) {
                if (barrack.level !== 0) {
                    barrack.num = barracksNums[index];
                }
            });
        }

        return !stopDistribution;
    };

    var calculateItems = function(type, params) {
        var levelValue;
        if (type === 'spells') {
            levelValue = params.storage.get('spells-level', 0);
        } else {
            var levels = [];
            var i = 0;
            while (++i <= types.buildings[type].count) {
                levels.push(params.storage.get(type + '-level-' + i, 0));
            }
            levelValue = Math.max.apply(null, levels);
        }

        var typeResult = {
            'capLevel': params.capLevel,
            'levelValue': levelValue,
            'objects': []
        };

        var totalCost = 0;
        var subtractedCost = 0;
        var totalSpace = 0;
        var totalTime = 0;
        var maxUnitTime = 0;
        var distribution = [];

        var stones = [];

        var tsIndex = -1; // ts - types sorted
        var tsLength = typesSorted[type].length;
        while (++tsIndex < tsLength) {
            var objectResult = {};

            var value = typesSorted[type][tsIndex];
            if (value[3] > levelValue) {
                continue;
            }

            var name = value[5];

            var quantity = params.storage.get(name, 0);
            var level = params.storage.get(name + '-level', 0);
            var costPerItem = value[1][level];
            var summaryCost = (costPerItem * quantity);

            objectResult.name = name;
            objectResult.summaryCost = summaryCost;
            objectResult.level = level;
            objectResult.minBarrackLevel = value[3];

            totalCost += summaryCost;

            totalSpace += (value[2] * quantity);
            if (type === 'spells') {
                totalTime += (value[0] * quantity);
            } else {
                var subtractQuantity = 0;
                if (params.current) {
                    subtractQuantity = parseInt(dom.id(name + '-subtract').value, 10) || 0;
                }

                if (subtractQuantity) {
                    goal.reach('SUBTRACT');
                }

                quantity -= subtractQuantity;
                if (quantity < 0) {
                    quantity = 0;
                }
                if (quantity) {
                    distribution.push([
                        tsIndex,
                        quantity,
                        value[3], // level
                        value[0], // time
                        value[2] // space
                    ]);
                    maxUnitTime = Math.max(maxUnitTime, value[0]);
                    totalTime += (value[0] * quantity);

                    stones.push({
                        'index': tsIndex,
                        'name': name,
                        'barrackLevel': value[3],
                        'time': value[0],
                        'space': value[2],
                        'quantity': quantity
                    });
                }

                subtractedCost += (costPerItem * quantity);

            }
            objectResult.quantity = quantity;

            typeResult.objects.push(objectResult);
        }
        typeResult.typesSorted = typesSorted[type];

        typeResult.totalCost = totalCost;
        typeResult.totalSpace = totalSpace;

        if (type === 'spells') {
            typeResult.totalTime = totalTime;
        } else {
            var barracksQueue = levels.map(function(level, index) {
                var num = index + 1;

                var isBoosted = false;
                if (params.current) {
                    isBoosted = localStorage.getItem(type + '-boosted-' + num) === 'yes';
                }

                return {
                    'num': num,
                    'time': 0,
                    'space': 0,
                    'maxSpace': types.buildings[type].queue[level],
                    'units': {},
                    'level': level,
                    'isBoosted': isBoosted,
                    'getActualTime': function() {
                        if (this.isBoosted) {
                            return Math.floor(this.time / 4);
                        }

                        return this.time;
                    }
                };
            });

            var boostedCount = barracksQueue.filter(function(barrack) {
                return barrack.isBoosted === true;
            }).length;

            if (boostedCount) {
                maxUnitTime = Math.ceil(maxUnitTime / 4);
            }

            var activeCount = barracksQueue.filter(function(barrack) {
                return barrack.level > 0;
            }).length;
            var virtualBarracksCount = activeCount + (boostedCount * 4);
            var avgTime = Math.max(Math.ceil(totalTime / virtualBarracksCount), maxUnitTime);

            if (params.current) {
                console.time('old distribution');
            }
            typeResult.fillSuccess = fillBarracks(barracksQueue, distribution, avgTime, activeCount);
            if (params.current) {
                console.timeEnd('old distribution');
            }
            typeResult.barracksQueue = barracksQueue;
            typeResult.subtractedCost = subtractedCost;


            var boxes = levels.map(function(level, index) {
                return {
                    'num': index + 1,
                    'time': 0,
                    'space': 0,
                    'maxSpace': types.buildings[type].queue[level],
                    'stones': {},
                    'level': level
                };
            });

            if (params.current) {
                console.time('NEW DISTRIBUTION');
                typeResult.distribution = fillBoxes(boxes, stones, type);
                console.timeEnd('NEW DISTRIBUTION');
            }
        }

        return typeResult;
    };

    function fillBoxes(boxes, stones, type) {
        var i, j, l, m;

        var activeBoxes = boxes.filter(function(box) {
            return (box.level !== 0);
        });

        if (!stones.length || !activeBoxes.length) {
            return {
                'stones': stones,
                'boxes': boxes
            };
        }

        var params = {
            'type': type
        };

        var totalTime = stones.reduce(function(a, b) {
            return a + (b.time * b.quantity);
        }, 0);

        params.averageTime = Math.ceil(totalTime / activeBoxes.length);

        var averageTimeCorrection = params.averageTime % 5;
        if (averageTimeCorrection !== 0) {
            params.averageTime += (5 - averageTimeCorrection);
        }

        params.averageTime = stones.reduce(function(a, b) {
            return Math.max(a, b.time);
        }, params.averageTime);

        console.log(params.averageTime);

        if (type === 'light') {
            var divideImportance = [7, 6, 5, 4, 10, 9, 8];
            var divideRules = {
                // stones count, max divided stones, divide parts
                10: [2, 2],
                9: [3, 2],
                8: [4, 2],
                7: [4, 2],
                6: [4, 2],
                5: [4, 2],
                4: [4, 3],
                3: [4, 3],
                2: [4, 3]
            };

            if (divideRules[stones.length]) {
                var divideCount = divideRules[stones.length][1];

                var stonesForDivide = stones.filter(function(stone) {
                    return stone.quantity >= divideCount && divideImportance.indexOf(stone.barrackLevel) !== -1;
                });

                stonesForDivide.sort(function(a, b) {
                    return divideImportance.indexOf(a.barrackLevel) - divideImportance.indexOf(b.barrackLevel);
                });

                for (i = 0, l = Math.min(divideRules[stones.length][0], stonesForDivide.length); i < l; i++) {
                    var partQuantity = Math.floor(stonesForDivide[i].quantity / divideCount);
                    for (j = 1, m = divideCount; j < m; j++) {
                        var stonePart = common.objectCopy(stonesForDivide[i]);
                        stonesForDivide[i].quantity -= partQuantity;
                        stonePart.quantity = partQuantity;
                        stones.push(stonePart);
                    }
                }
            }
        }

        // lowest first
        activeBoxes.sort(function(a, b) {
            return a.level - b.level;
        });

        var attempts = makeAttempts(activeBoxes, stones, params);

        attempts.sort(function(a, b) {
            if (a.stones.length === b.stones.length) {
                return a.time - b.time;
            }
            return a.stones.length - b.stones.length;
        });

        activeBoxes = attempts[0].boxes;

        for (i = 0, l = activeBoxes.length; i < l; i++) {
            for (j = 0, m = boxes.length; j < m; j++) {
                if (activeBoxes[i].num === boxes[j].num) {
                    boxes[j] = activeBoxes[i];
                }
            }
        }

        return {
            'remaining': attempts[0].stones.length,
            'boxes': boxes
        };
    }

    function makeAttempts(activeBoxes, stones, params) {
        var i, j, k, l, m, n;

        var attempts = [];

        var variants0 = findOptimal(activeBoxes[0], stones, params, 5);

        for (j = 0, m = variants0.length; j < m; j++) {
            var attemptBoxes1 = common.objectCopy(activeBoxes);
            var attemptStones1 = common.objectCopy(stones);

            processVariant(attemptBoxes1[0], variants0[j], attemptStones1, params);

            for (k = 1, n = activeBoxes.length; k < n; k++) {
                var variants1 = findOptimal(attemptBoxes1[k], attemptStones1, params, 5);

                for (var s = 0, t = variants1.length; s < t; s++) {
                    var attemptBoxes2 = common.objectCopy(attemptBoxes1);
                    var attemptStones2 = common.objectCopy(attemptStones1);

                    processVariant(attemptBoxes2[k], variants1[s], attemptStones2, params);

                    for (var x = k + 1, y = attemptBoxes2.length; x < y; x++) {
                        var variants2 = findOptimal(attemptBoxes2[x], attemptStones2, params, 1);

                        if (variants2.length) {
                            processVariant(attemptBoxes2[x], variants2[0], attemptStones2, params);
                        }
                    }

                    fillRemaining(attemptBoxes2, attemptStones2);

                    var time2 = getBoxesMaxTime(attemptBoxes2);

                    attempts.push({'boxes': attemptBoxes2, 'stones': attemptStones2, 'time': time2});

                    if (time2 === params.averageTime && !attemptStones2.length) {
                        return attempts;
                    }
                }
            }

            fillRemaining(attemptBoxes1, attemptStones1);

            var time1 = getBoxesMaxTime(attemptBoxes1);

            attempts.push({'boxes': attemptBoxes1, 'stones': attemptStones1, 'time': time1});

            if (time1 === params.averageTime && !attemptBoxes1.length) {
                return attempts;
            }
        }

        return attempts;
    }

    function getBoxesMaxTime(boxes) {
        return boxes.reduce(function(maxTime, box) {
            return Math.max(maxTime, box.time);
        }, 0);
    }

    function fillRemaining(boxes, stones) {
        var i, j, k, l, m, n;

        // max time first
        stones.sort(function(a, b) {
            return b.time - a.time;
        });
        for (i = 0; i < stones.length; i++) {
            var stone = stones[i];

            for (j = 0, m = stone.quantity; j < m; j++) {
                // min time first
                boxes.sort(function(a, b) {
                    return a.time - b.time;
                });

                for (k = 0, n = boxes.length; k < n; k++) {
                    var box = boxes[k];

                    if (isBoxMatch(box, stone, null)) {
                        fillBox(box, stone);
                        stone.quantity--;
                        if (stone.quantity === 0) {
                            stones.splice(i, 1);
                            i--;
                        }
                        break;
                    }
                }
            }
        }
    }

    function findOptimal(box, stones, params, returnCount) {
        var actual = stones.filter(function(stone) {
            return stone.barrackLevel <= box.level;
        });

        var variants = [];

        if (!actual.length) {
            return variants;
        }

        var hashes = [];

        var all = combine(actual, (actual.length === 1 ? 1 : 2));

        for (var i = 0; i < all.length; i++) {
            // space, time, stones
            var fastBox = [0, 0, []];
            var hash = '';

            // it's important
            all[i].sort(function(a, b) {
                //return b.time - a.time;
                if (b.space === a.space) {
                    return b.time - a.time;
                }
                return b.space - a.space;
            });

            for (var j = 0; j < all[i].length; j++) {
                var stone = all[i][j];
                for (var k = 0; k < stone.quantity; k++) {
                    var isMatchSpace = ((fastBox[0] + stone.space) <= box.maxSpace);
                    var isMatchTime = ((fastBox[1] + stone.time) <= params.averageTime);

                    if (isMatchSpace && isMatchTime) {
                        fastBox[0] += stone.space;
                        fastBox[1] += stone.time;
                        if (!fastBox[2][stone.index]) {
                            fastBox[2][stone.index] = 1;
                        } else {
                            fastBox[2][stone.index]++;
                        }
                    }
                }
            }

            for (var m = 0; m < fastBox[2].length; m++) {
                if (fastBox[2][m]) {
                    hash += m + '.' + fastBox[2][m] + '-';
                }
            }

            if (hashes.indexOf(hash) !== -1) {
                continue;
            }

            hashes.push(hash);

            variants.push(fastBox);
        }

        // max time and max space first
        variants.sort(function(a, b) {
            if (a[1] === b[1]) {
                return b[0] - a[0];
            }
            return b[1] - a[1];
        });

        return variants.slice(0, returnCount);
    }

    function processVariant(box, variant, stones, params) {
        box.space = variant[0];
        box.time = variant[1];
        box.stones = {};
        for (var p = 0; p < variant[2].length; p++) {
            if (variant[2][p]) {
                box.stones[typesSorted[params.type][p][5]] = variant[2][p];
            }
        }

        var subtract = common.objectCopy(box.stones);

        for (var i = 0; i < stones.length; i++) {
            if (subtract[stones[i].name]) {
                var amount = Math.min(subtract[stones[i].name], stones[i].quantity);
                subtract[stones[i].name] -= amount;
                stones[i].quantity -= amount;
                if (stones[i].quantity === 0) {
                    stones.splice(i, 1);
                    i--;
                }
            }
        }
    }

    function combine(input, size){
        var results = [];
        var result;
        var mask;
        var total = Math.pow(2, input.length);

        for (mask = 0; mask < total; mask++) {
            result = [];
            var i = input.length - 1;
            do {
                if ((mask & (1 << i)) !== 0) {
                    result.push(input[i]);
                }
            } while(i--);
            if (result.length >= size) {
                results.push(result);
            }
        }

        return results;
    }

    function fillBox(box, stone) {
        box.space += stone.space;
        box.time += stone.time;
        if (!box.stones[stone.name]) {
            box.stones[stone.name] = 0;
        }
        box.stones[stone.name]++;
        //stone.used = true;
    }

    function isBoxMatch(box, stone, averageTime) {
        var isMatchLevel = (stone.barrackLevel <= box.level);
        var isMatchSpace = ((box.space + stone.space) <= box.maxSpace);

        var isMatchTime = true;
        if (averageTime !== null) {
            isMatchTime = ((box.time + stone.time) <= averageTime);
        }

        return (isMatchLevel && isMatchSpace && isMatchTime);
    }

    var calculate = function(params) {
        var result = {
            'params': params
        };

        result.armyCampsSpace = params.storage.get('army-camps', 0);

        ['light', 'dark', 'spells'].forEach(function(type) {
            var capLevel;
            if (type === 'spells') {
                capLevel = types.buildings.spells.max;
            } else {
                capLevel = types.buildings[type].maxLevel;
            }

            result[type] = calculateItems(type, {
                'storage': params.storage,
                'current': params.current,
                'capLevel': capLevel
            });
        });

        return result;
    };

    return calculate;
});
part('calculateCurrent', [
    'storage',
    'dom',
    'types',
    'common',
    'calculate'
], function(storage, dom, types, common, calculate) {

    'use strict';

    var setQuantityAndSpace = function(maxSpace, totalSpace, type) {
        var spaceDiff = maxSpace - totalSpace;
        if (spaceDiff < 0) {
            spaceDiff = '<span class="limit-exceeded">' + spaceDiff.toString().replace('-', '&minus;') + '</span>';
        }
        dom.updater.defer(type + '-quantity', 'html', spaceDiff);

        var space = totalSpace;
        if (totalSpace > maxSpace) {
            space = '<span class="limit-exceeded">' + totalSpace + '</span>';
        }
        space = space + '&thinsp;/&thinsp;' + maxSpace;
        dom.updater.defer(type + '-space', 'html', space);

    };

    var populateDistribution = function(result, type) {
        var times = [];
        if (!result.distribution.remaining) {
            dom.updater.defer(type + '-exceeded', 'display', 'none');
            var maxTime = 0;
            var maxNum = 1;

            while (result.distribution.boxes.length) {
                var barrack = result.distribution.boxes.shift();

                for (var unitIndex in barrack.stones) {
                    dom.updater.defer('quantity-' + unitIndex + '-' +
                                      barrack.num, 'text', '×' + barrack.stones[unitIndex]);
                }

                var actualTime = barrack.time;
                if (actualTime > maxTime) {
                    maxTime = actualTime;
                    maxNum = parseInt(barrack.num, 10);
                }

                var time = (actualTime ? common.getFormattedTime(actualTime) : '');
                if (barrack.isBoosted) {
                    time = '<span class="boosted">' + time + '</span>';
                }
                times[barrack.num] = time;

                var spaceData = '';
                if (barrack.maxSpace !== 0) {
                    spaceData = barrack.space + ' / ';
                }
                dom.updater.defer(type + '-space-' + barrack.num, 'text', spaceData);
            }
            times.forEach(function(time, num) {
                if (num === maxNum) {
                    time = '<span class="result">' + time + '</span>';
                }
                dom.updater.defer(type + '-time-' + num, 'html', time);
            });
        } else {
            dom.updater.defer(type + '-exceeded', 'display', '');
            var spaces = [];
            var sumSpace = 0;
            while (result.distribution.boxes.length) {
                var barrack = result.distribution.boxes.shift();
                dom.updater.defer(type + '-time-' + barrack.num, 'text', '');

                spaces[barrack.num] = barrack.space;
                sumSpace += barrack.space;
            }

            spaces.forEach(function(space, num) {
                var barrackSpaceId = type + '-space-' + num;
                if (space === 0) {
                    dom.updater.defer(barrackSpaceId, 'text', '');
                } else {
                    if (num === 1) {
                        space += result.totalSpace - sumSpace;
                        dom.updater.defer(barrackSpaceId, 'html',
                                          '<span class="limit-exceeded result">' + space + '</span> / ');

                    } else {
                        dom.updater.defer(barrackSpaceId, 'text', space + ' / ');
                    }
                }
            });
        }
    };

    var darkObjects = dom.find('.js-dark-object');
    var spellsObjects = dom.find('.js-spells-object');
    dom.listenCustom('calculateDone', function(result) {
        /*
        Types:
            all
            barrack-dark
            barrack-light
            units
            dark
            spells
         */

        if (result.params.type === 'all' || result.params.type === 'barrack-dark') {
            darkObjects.iterate(function(el) {
                el.style.display = (result.dark.levelValue === 0 ? 'none' : '');
            });
        }

        if (result.params.type === 'all' || result.params.type !== 'spells') {
            var togetherSpace = result.light.totalSpace + result.dark.totalSpace;
            setQuantityAndSpace(result.armyCampsSpace, togetherSpace, 'light');
            setQuantityAndSpace(result.armyCampsSpace, togetherSpace, 'dark');
        }

        if (result.params.type === 'all' || result.params.type === 'spells') {
            setQuantityAndSpace(result.spells.levelValue, result.spells.totalSpace, 'spells');

            var spellsTimeId = 'spells-time';
            var spellsTimeValue = '';
            if (result.spells.totalTime) {
                if (localStorage.getItem('spells-boosted') === 'yes') {
                    spellsTimeValue = '<span class="boosted">' +
                                      common.getFormattedTime(Math.floor(result.spells.totalTime / 4), true) +
                                      '</span>';
                } else {
                    spellsTimeValue = common.getFormattedTime(result.spells.totalTime, true);
                }

            }
            dom.updater.defer(spellsTimeId, 'html', spellsTimeValue);

            spellsObjects.iterate(function(el) {
                el.style.display = (result.spells.levelValue === 0 ? 'none' : '');
            });
        }

        ['light', 'dark', 'spells'].forEach(function(type) {
            if (['all', 'barrack-' + type, type].indexOf(result.params.type) !== -1) {
                var clIndex = result[type].capLevel + 1;
                while (--clIndex > 0) {
                    var rowId = type + '-building-level-' + clIndex;
                    var rowEl = dom.id(type + '-building-level-' + clIndex);

                    if (clIndex > result[type].levelValue) {
                        dom.updater.instantly(rowId, 'display', 'none');

                        dom.find('td.changed-animation', rowEl).iterate(function(el) {
                            el.classList.remove('changed-animation');
                        });
                    } else {
                        dom.updater.instantly(rowId, 'display', '');
                    }
                }

                result[type].objects.forEach(function(objectResult) {
                    dom.updater.defer(objectResult.name + '-summary', 'text',
                                      objectResult.summaryCost ? common.numberFormat(objectResult.summaryCost) : '');

                    if (type !== 'spells') {
                        var mcIndex = 0; // mc - max count
                        var mcLength = types.buildings[type].count;
                        while (++mcIndex <= mcLength) {
                            dom.updater.defer('quantity-' + objectResult.name + '-' + mcIndex, 'text', '');
                        }
                    }
                });

                dom.updater.defer(type + '-cost', 'text', common.numberFormat(result[type].totalCost));

                if (type !== 'spells') {
                    populateDistribution(result[type], type);

                    var subtractedCostId = type + '-subtracted-cost';
                    if (result[type].subtractedCost === result[type].totalCost) {
                        dom.updater.defer(subtractedCostId, 'text', '');
                    } else {
                        dom.updater.defer(subtractedCostId, 'html',
                                          '−&thinsp;' +
                                          common.numberFormat(result[type].totalCost - result[type].subtractedCost) +
                                          '&thinsp;=&thinsp;<span class="result">' +
                                          common.numberFormat(result[type].subtractedCost) + '</span>');
                    }
                }
            }
        });

        dom.updater.defer('grand-total', 'text', common.numberFormat(result.light.subtractedCost + result.spells.totalCost));

        dom.updater.runDeferred();
    });

    return function(type) {
        var params =  {
            'type': type,
            'storage': storage.current,
            'current': true
        };

        var calculateResult = calculate(params);
        if (storage.save()) {
            dom.triggerCustom('calculateDone', calculateResult);
        }
    };

});
part('collection', [
    'dom',
    'storage',
    'calculateCurrent'
], function(dom, storage, calculateCurrent) {
    'use strict';

    var collection = (function() {
        var items = {};

        var update = function(key, params, source, newValue) {
            if (Array.isArray(newValue)) {
                newValue = newValue[params.index - 1];
            }

            storage.current.set(key, parseInt(newValue, 10));

            if (source === 'dom') {
                calculateCurrent(params.calculateType);
            }

            var newValueString = newValue.toString();

            if ((source === 'storage' || source === 'settings') && params.el.value !== newValueString) {
                params.el.value = newValueString;

                if (source === 'settings') {
                    params.el.parentNode.classList.add('changed-animation');
                }
            }

            if (params.onUpdate) {
                params.onUpdate(key, params);
            }
        };

        return {
            'add': function(key, params) {
                params.el = dom.id(key);
                dom.listen(params.el.parentNode, 'animationend', function(e) {
                    e.target.classList.remove('changed-animation');
                });

                if (params.calculateType === '__fromAttr') {
                    params.calculateType = params.el.getAttribute('data-type');
                }

                if (!params.update) {
                    params.update = update;
                }

                items[key] = params;
            },
            'update': function(key) {
                var params = items[key];
                params.update(key, params, 'dom', params.el.value);
            },
            'updateFromStorage': function() {
                Object.keys(items).forEach(function(key) {
                    var params = items[key];
                    params.update(
                        key,
                        params,
                        'storage',
                        storage.current.get(key, params.el.value)
                    );
                });
            },
            'updateSetting': function(th, helper) {
                Object.keys(items).forEach(function(key) {
                    var params = items[key];
                    params.update(key, params, 'settings', helper(th, params.th));
                });
            }
        };
    }());

    dom.listenCustom('storageUpdated', collection.updateFromStorage);

    return collection;

});

part('boostedCollection', [
    'dom',
    'goal',
    'calculateCurrent',
    'localStorageSet',
    'storage'
], function(dom, goal, calculateCurrent, localStorageSet, storage) {
    'use strict';

    var boostedCollection = (function() {
        var items = {};

        return {
            'add': function(key, type) {
                var params = {
                    'type': type,
                    'el': dom.id(key)
                };
                items[key] = params;
                if (localStorage.getItem(key) === 'yes') {
                    params.el.checked = true;
                }
            },
            'update': function(key) {
                var setResult = localStorageSet(key, (items[key].el.checked ? 'yes': 'no'), (storage.all.length - 1));
                if (setResult) {
                    goal.reach('BOOSTED', {'boostedType': items[key].type});
                    calculateCurrent(items[key].type);
                }
            }
        };
    }());

    return boostedCollection;

});

part([
    'dom',
    'goal',
    'collection',
    'calculateCurrent',
    'localStorageSet',
    'storage'
], function(dom, goal, collection, calculateCurrent, localStorageSet, storage) {

    'use strict';

    var getSettingValue = function(selectedTh, allTh) {
        while (!allTh.hasOwnProperty(selectedTh) && selectedTh > 0) {
            selectedTh--;
        }
        return allTh[selectedTh];
    };

    var setLevels = function(th) {
        collection.updateSetting(th, getSettingValue);

        goal.reach('SETTINGS_TH', {'settingsLevel': th.toString()});

        calculateCurrent('all');
    };

    dom.find('.js-settings-level').listen('universalClick', function(e) {
        setLevels(parseInt(e.currentTarget.textContent, 10));
    });

});


part('favorites', [
    'storage',
    'dom',
    'calculate',
    'common',
    'smoothScroll',
    'goal',
    'calculateCurrent'
], function(storage, dom, calculate, common, smoothScroll, goal, calculateCurrent) {

    'use strict';

    var viewSharedMessageHide = function() {
        dom.updater.instantly('view-shared', 'display', 'none');
    };

    var barracksAnchor = dom.id('light-anchor');

    var content = dom.id('favorites');
    var template = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"favorite js-favorite\" data-num=\"");t.b(t.v(t.f("index",c,p,0)));t.b("\">");t.b("\n" + i);t.b("<input class=\"favorite__title js-favorite-title\"");t.b("\n" + i);t.b("placeholder=\"Untitled\"");t.b("\n" + i);t.b("value=\"");t.b(t.v(t.f("title",c,p,0)));t.b("\"");t.b("\n" + i);t.b("data-num=\"");t.b(t.v(t.f("index",c,p,0)));t.b("\"");t.b("\n" + i);t.b("size=\"10\"/>");t.b("\n" + i);if(t.s(t.f("types",c,p,1),c,p,0,189,585,"{{ }}")){t.rs(c,p,function(c,p,t){if(t.s(t.f("totalCapacity",c,p,1),c,p,0,208,301,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("<div class=\"favorite__capacity\">");t.b(t.v(t.f("totalCapacity",c,p,0)));t.b("&thinsp;/&thinsp;");t.b(t.v(t.f("maximumCapacity",c,p,0)));t.b("</div>");t.b("\n" + i);});c.pop();}t.b("<table class=\"favorite__objects\">");t.b("\n" + i);if(t.s(t.f("items",c,p,1),c,p,0,364,432,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("<tr>");t.b("\n" + i);t.b("<td class=\"number\">×");t.b(t.v(t.f("quantity",c,p,0)));t.b("</td>");t.b("\n" + i);t.b("<td>");t.b(t.v(t.f("name",c,p,0)));t.b("</td>");t.b("\n" + i);t.b("</tr>");t.b("\n" + i);});c.pop();}t.b("</table>");t.b("\n" + i);t.b("<div class=\"favorite__time\">");t.b(t.t(t.f("time",c,p,0)));t.b("</div>");t.b("\n" + i);t.b("<div class=\"favorite__cost\">");t.b("\n" + i);t.b("<span class=\"icon-");t.b(t.v(t.f("costModifier",c,p,0)));t.b("\">");t.b(t.v(t.f("cost",c,p,0)));t.b("</span>");t.b("\n" + i);t.b("</div>");t.b("\n" + i);});c.pop();}t.b("<span class=\"button js-favorite-load\" data-num=\"");t.b(t.v(t.f("index",c,p,0)));t.b("\">Load</span>");t.b("\n" + i);t.b("<span class=\"button button_after js-favorite-delete\" data-num=\"");t.b(t.v(t.f("index",c,p,0)));t.b("\">Remove</span>");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }});

    var loadHandler = function(e) {
        goal.reach('LOAD_SAVED');

        var index = parseInt(e.currentTarget.getAttribute('data-num'), 10);
        var dataToLoad = common.objectCopy(storage.all[index].getAll());
        storage.current = new common.Dict(dataToLoad);
        storage.current.set('favorite-title', '');

        dom.triggerCustom('storageUpdated');
        calculateCurrent('all');

        viewSharedMessageHide();
        smoothScroll.scrollTo(barracksAnchor);
    };

    var deleteHandler = function(e) {
        goal.reach('DELETE_SAVED');

        var index = parseInt(e.currentTarget.getAttribute('data-num'), 10);

        var el = content.querySelector('.js-favorite[data-num="' + index + '"]');
        dom.listen(el, 'transitionend', function() {
            el.parentNode.removeChild(el);

            dom.find('.js-favorite', content).iterate(function(item) {
                var oldIndex = parseInt(item.getAttribute('data-num'), 10);
                if (oldIndex > index) {
                    var newIndex = (oldIndex - 1).toString();
                    item.setAttribute('data-num', newIndex);
                    dom.find('[data-num]', item).iterate(function(sub) {
                        sub.setAttribute('data-num', newIndex);
                    });
                }
            });
        });
        el.classList.add('favorite_deleted');

        storage.all.splice(index, 1);
        storage.save();
    };

    var animationEndHandler = function(e) {
        e.currentTarget.classList.remove('favorite_added');
    };

    var saveTitle = function(e) {
        var index = parseInt(e.currentTarget.getAttribute('data-num'), 10);
        storage.all[index].set('favorite-title', e.currentTarget.value);
        storage.save();
    };

    var addListeners = function(el, isRoot) {
        dom.find('.js-favorite-load', el).listen('universalClick', loadHandler);
        dom.find('.js-favorite-delete', el).listen('universalClick', deleteHandler);
        if (isRoot) {
            dom.listen(el, 'animationend', animationEndHandler);
        } else {
            dom.find('.js-favorite', el).listen('animationend', animationEndHandler);
        }

        dom.find('.js-favorite-title', el).listen('input', saveTitle);
    };

    var favoritesCreateItem = function(data, index) {
        if (index === 0) {
            return;
        }
        var templateVars = {
            'index': index,
            'title': data.get('favorite-title', ''),
            'types': []
        };

        var result = calculate({
            'type': 'all',
            'current': false,
            'storage': data
        });

        var modifiers = {
            'light': 'elixir',
            'dark': 'dark-elixir',
            'spells': 'elixir'
        };

        ['light', 'dark', 'spells'].forEach(function(type) {
            var items = [];

            if (type !== 'spells') {
                result[type].objects.sort(function(a, b) {
                    return a.minBarrackLevel - b.minBarrackLevel;
                });
            }

            result[type].objects.forEach(function(objectResult) {
                if (objectResult.quantity) {
                    items.push({
                        'name': common.convertToTitle(objectResult.name),
                        'quantity': objectResult.quantity
                    });
                }
            });

            if (items.length) {
                var data = {
                    'items': items,
                    'cost': common.numberFormat(result[type].totalCost),
                    'costModifier': modifiers[type]
                };

                if (type === 'spells') {
                    data.totalCapacity = result[type].totalSpace;
                    data.maximumCapacity = result[type].levelValue;
                    data.time = common.getFormattedTime(result[type].totalTime, true);
                } else {
                    var productionTime;
                    if (result[type].fillSuccess) {
                        productionTime = Math.max.apply(null, result[type].barracksQueue.map(function(barrack) {
                            return barrack.time;
                        }));
                        productionTime = common.getFormattedTime(productionTime);
                    }
                    data.time = productionTime;
                }

                templateVars.types.push(data);
            }

        });

        var togetherSpace = result.light.totalSpace + result.dark.totalSpace;
        if (togetherSpace) {
            templateVars.types[0].totalCapacity = togetherSpace;
            templateVars.types[0].maximumCapacity = result.armyCampsSpace;
        }

        return template.render(templateVars);
    };

    var addedAnimation = function(index) {
        var composition = content.querySelector('.js-favorite[data-num="' + index + '"]');
        smoothScroll.scrollTo(composition, function() {
            composition.classList.add('favorite_added');
        });
    };

    var add = function() {
        var output = {};

        var sourceData = storage.getForDiff();
        if (sourceData[0]) {
            var currentJSON = JSON.stringify(sourceData[0]);
            var sdIndex = 0;
            var sdLength = sourceData.length;
            while (++sdIndex < sdLength) {
                var savedJSON = JSON.stringify(sourceData[sdIndex]);
                if (currentJSON === savedJSON) {
                    output.exists = true;
                    output.index = sdIndex;
                    return output;
                }
            }

            var index = storage.all.length;
            var data = new common.Dict(common.objectCopy(storage.current.getAll()));
            storage.all.push(data);

            if (storage.save()) {
                content.insertAdjacentHTML('beforeend', favoritesCreateItem(data, index));
                addListeners(content.lastChild, true);

                output.added = true;
                output.index = index;
            } else {
                storage.all.pop();
            }
        }

        return output;
    };

    dom.find('.js-favorite-add').listen('universalClick', function(e) {
        e.preventDefault();
        var result = add(true);
        if (result.added) {
            goal.reach('SAVE_COMPOSITION', {'favoriteButton': e.target.textContent});
        }

        if (result.index) {
            addedAnimation(result.index);
        }
    });

    setTimeout(function() {
        content.innerHTML = storage.all.map(favoritesCreateItem).join('');
        addListeners(content);
    }, 0);

    window.yandexMetrikaParams.favoritesCount = (storage.all.length ? storage.all.length - 1 : 0).toString();

    return {
        'addBeforeShare': function() {
            var result = add();
            if (result.added || result.exists) {
                dom.listen(dom.id('view-shared'), 'universalClick', viewSharedMessageHide);
                dom.updater.instantly('view-shared', 'display', '');
            }
        }
    };

});

part([
    'storage',
    'dom',
    'common',
    'converter',
    'favorites',
    'goal'
], function(storage, dom, common, converter, favorites, goal) {

    'use strict';

    var version = 0;
    if (location.search.indexOf('?l=') !== -1) {
        version = 1;
    } else if (location.search.indexOf('?s=') !== -1) {
        version = 2;
    } else if (location.search.indexOf('?s3=') !== -1) {
        version = 3;
    }

    if (version !== 0) {
        var urlData = location.search.substr((version === 3 ? 4 : 3));
        urlData = decodeURIComponent(urlData);

        var goalParams = {};
        goalParams['shareV' + version] = urlData;
        goal.reach('SHARE', goalParams);

        urlData = urlData.replace(/[a-z]/g, ',');
        urlData = urlData.replace(/"+$/, '');
        urlData = urlData.replace(/,$/, '');
        urlData = urlData.replace(/,(?=,)/g, ',0');
        if (urlData[0] === ',') {
            urlData = '0' + urlData;
        }
        urlData = '[' + urlData + ']';
        try {
            urlData = JSON.parse(urlData);
        } catch (ignore) {
            urlData = false;
        }

        history.replaceState({}, '', location.protocol + '//' + location.host + location.pathname);

        if (urlData) {
            if (version === 1) {
                converter.oldConvert3to4(urlData);
            } else if (version === 2) {
                converter.oldConvert4to5(urlData);
            }

            urlData = storage.dataArrayToObject(urlData);

            favorites.addBeforeShare();

            storage.current = new common.Dict(urlData);
            storage.save();
        }
    }

    var shareLinks = dom.find('.js-share-link');
    var permalink = dom.id('share-permalink');
    dom.selectOnFocus(permalink, function() {
        goal.reach('SHARE_LINK');
    });
    var makePermalink = function() {
        var url = 'http://mkln.ru/clash-of-clans/?s3=';
        var data = common.objectCopy(storage.current.getAll());
        data = storage.dataObjectToArray(data);
        storage.excludeIndexes.forEach(function(excludeIndex) {
            data[excludeIndex] = null;
        });
        data = JSON.stringify(data);
        data = data.replace(/\b(?:null|0)\b/g, '');
        data = data.substr(1, data.length - 2);
        data = data.replace(/,+$/, '');

        // 97 - a, 122 - z
        var charCode = 97;
        data = data.replace(/,/g, function() {
            var letter = String.fromCharCode(charCode);
            if (charCode === 122) {
                charCode = 97;
            } else {
                charCode++;
            }
            return letter;
        });
        permalink.value = url + data;

        var shareUrl = encodeURIComponent(url + data);
        shareLinks.iterate(function(shareLink) {
            shareLink.setAttribute('href', shareLink.getAttribute('data-share-link').replace('{url}', shareUrl));
        });
    };

    var shareObjects = dom.find('.js-share');
    var placeShareContent = function(result) {
        var display = '';
        var isAvailable = ['light', 'dark', 'spells'].some(function(type) {
            if (result[type].totalCost) {
                return true;
            }
        });
        if (isAvailable) {
            makePermalink();
        } else {
            display = 'none';
        }
        shareObjects.iterate(function(el) {
            el.style.display = display;
        });
    };

    // without timeout repaint of permalink.value in iOS took too much time
    var placeShareContentTimeout;
    dom.listenCustom('calculateDone', function(result) {
        clearTimeout(placeShareContentTimeout);
        placeShareContentTimeout = setTimeout(function() {
            placeShareContent(result);
        }, 300);
    });

});

part([
    'storage',
    'types',
    'dom',
    'collection',
    'boostedCollection',
    'calculateCurrent'
], function(storage, types, dom, collection, boostedCollection, calculateCurrent) {
    'use strict';

    dom.listen(document.body, 'change', function(e) {
        if (e.target.classList.contains('js-comp-level')) {
            collection.update(e.target.getAttribute('id'));
        } else if (e.target.classList.contains('js-comp-boosted')) {
            boostedCollection.update(e.target.getAttribute('id'));
        }
    });

    collection.add('army-camps', {
        'calculateType': 'all',
        'th': {
            1: 20,
            2: 30,
            3: 70,
            4: 80,
            5: 135,
            6: 150,
            7: 200,
            9: 220,
            10: 240
        }
    });

    collection.add('spells-level', {
        'calculateType': 'spells',
        'th': {
            1: 0,
            5: 1,
            6: 2,
            7: 3,
            9: 4,
            10: 5
        },
        'onUpdate': function(key) {
            dom.updater.instantly(
                'spells-boosted-wrapper',
                'display',
                (storage.current.get(key, 0) === 0 ? 'none' : '')
            );
        }
    });

    boostedCollection.add('spells-boosted', 'spells');

    ['light', 'dark'].forEach(function(type) {
        var barrackData = types.buildings[type];
        var i = 0;
        while (++i <= barrackData.count) {
            collection.add(type + '-level-' + i, {
                'index': i,
                'calculateType': 'barrack-' + type,
                'th': barrackData.th,
                'onUpdate': function(key, params) {
                    var header = '';
                    var level = storage.current.get(key, 0);
                    if (level !== 0) {
                        header = barrackData.queue[level];
                    }
                    dom.updater.instantly(type + '-maxSpace-' + params.index, 'text', header);
                    dom.updater.instantly(type + '-levelText-' + params.index, 'text', level);

                    dom.updater.instantly(type + '-barrack-info-' + params.index, 'display',
                                          (level === 0 ? 'none' : ''));

                }
            });

            boostedCollection.add(type + '-boosted-' + i, type);
        }
    });

    types.iterateTree(function(type, name, properties) {
        collection.add(name + '-level', {
            'calculateType': '__fromAttr',
            'th': properties[4],
            'attachEvent': false
        });
    });


    /**
     * QUANTITY / SUBTRACT
     */

    dom.listen(document.body, 'input', function(e) {
        var el = e.target;
        var isQuantity = el.classList.contains('js-comp-quantity');
        var isSubtract = el.classList.contains('js-comp-subtract');
        if (isQuantity || isSubtract) {
            var value = parseInt(el.value, 10) || 0;
            if (value < 0) {
                value = 0;
            }
            el.value = value || '';

            if (isQuantity) {
                storage.current.set(el.getAttribute('id'), value);
            }

            calculateCurrent(el.getAttribute('data-type'));
        }

    });

    dom.listenCustom('storageUpdated', function() {
        types.iterateTree(function(type, name) {
            dom.id(name).value = storage.current.get(name) || '';
        });
    });


    /**
     * INIT
     */

    dom.triggerCustom('storageUpdated');

    calculateCurrent('all');

});

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
part([
    'dom',
    'goal'
], function(dom, goal) {

    'use strict';

    dom.find('.js-reset').listen('universalClick', function(e) {
        var resetType = e.currentTarget.getAttribute('data-reset');
        var scope = e.currentTarget.getAttribute('data-scope');

        dom.findCache('input.js-comp-' + scope + '[data-type="' + resetType + '"]').iterate(function(el) {
            el.value = '';
            dom.trigger(el, 'input');
        });

        goal.reach('RESET', {'resetType': resetType});
    });

});

part([
    'dom'
], function(dom) {
    'use strict';

    var BASE_CLASS = 'help-tooltip';

    var VISIBLE_CLASS = BASE_CLASS + '_visible';
    var RIGHT_CLASS = BASE_CLASS + '_right';

    var HIDDEN_POSITION = '-999px';

    var X_OFFSET = 15;
    var Y_OFFSET = 7;

    var el;
    var isInitialized = false;
    var hideTimeout;

    var initialize = function() {
        el = document.createElement('div');
        el.classList.add(BASE_CLASS);
        el.style.left = HIDDEN_POSITION;
        document.body.appendChild(el);

        dom.listen(el, 'transitionend', function() {
            if (!el.classList.contains(VISIBLE_CLASS)) {
                el.style.left = HIDDEN_POSITION;
            }
        });

        var isHide;
        dom.listen(window, 'touchstart', function(e) {
            isHide = (e.target !== el);
            if (isHide && el.classList.contains(VISIBLE_CLASS)) {
                hideTimeout = setTimeout(function() {
                    el.classList.remove(VISIBLE_CLASS);
                }, 300);
            }
        });
        dom.listen(window, 'touchmove', function() {
            isHide = false;
        });
        dom.listen(window, 'touchend', function() {
            clearTimeout(hideTimeout);
            if (isHide) {
                el.classList.remove(VISIBLE_CLASS);
            }
        });

        ['mousedown', 'resize'].forEach(function(eventName) {
            dom.listen(window, eventName, function(e) {
                if (e.target !== el) {
                    el.classList.remove(VISIBLE_CLASS);
                }
            });
        });
    };

    dom.find('.js-help-link').listen('universalClick', function(e) {
        e.stopPropagation();

        if (!isInitialized) {
            initialize();
            isInitialized = true;
        }

        clearTimeout(hideTimeout);

        var linkEl = e.currentTarget;

        el.style.left = HIDDEN_POSITION;
        el.style.width = 'auto';
        el.innerHTML = linkEl.querySelector('.js-help-content').innerHTML;

        var width = el.offsetWidth;
        var scrollLeft = window.pageXOffset;
        var windowWidth = window.innerWidth;
        var elPosition = linkEl.getBoundingClientRect();
        var elPositionLeft = elPosition.left + scrollLeft;
        var elPositionTop = elPosition.top + window.pageYOffset;

        var left = elPositionLeft - X_OFFSET;
        if ((left + width) > (scrollLeft + windowWidth) && (windowWidth / 2) < (left - scrollLeft)) {
            left = elPositionLeft - width + linkEl.offsetWidth + X_OFFSET;
            if (left <= 0) {
                el.style.width = (elPositionLeft + X_OFFSET - 1) + 'px';
                left = 1;
            }
            el.classList.add(RIGHT_CLASS);
        } else {
            el.classList.remove(RIGHT_CLASS);
        }

        el.style.top = (elPositionTop + linkEl.offsetHeight + Y_OFFSET) + 'px';
        el.style.left = left + 'px';
        el.classList.add(VISIBLE_CLASS);
    });

});

part([
    'dom'
], function(dom){

    'use strict';

    if (!window.mkSupport.mobile) {
        return;
    }

    var ITEMS_ACTIVE_CLASS = 'menu__items_active';
    var SWITCHER_SELECTED_CLASS = 'menu__item_selected';

    var VISIBLE_POSITION = '18px';
    var HIDDEN_POSITION = '-999px';

    var switcher = document.querySelector('.js-menu-switcher');
    var items = document.querySelector('.js-menu-items');
    items.style.right = HIDDEN_POSITION;

    dom.listen(switcher, 'universalClick', function() {
        if (switcher.classList.contains(SWITCHER_SELECTED_CLASS)) {
            return;
        }

        items.classList.add(ITEMS_ACTIVE_CLASS);
        items.style.right = VISIBLE_POSITION;
        switcher.classList.add(SWITCHER_SELECTED_CLASS);
    });

    var hide = function() {
        items.classList.remove(ITEMS_ACTIVE_CLASS);
        switcher.classList.remove(SWITCHER_SELECTED_CLASS);
    };

    dom.listen(window, 'touchmove', hide);
    dom.listen(window, 'touchend', function(e) {
        if (e.target !== switcher) {
            hide();
        }
    });

    dom.listen(items, 'transitionend', function() {
        if (!items.classList.contains(ITEMS_ACTIVE_CLASS)) {
            items.style.right = HIDDEN_POSITION;
        }
    });

});

part([
    'dom',
    'goal',
    'smoothScroll'
], function(dom, goal, smoothScroll){

    'use strict';

    dom.find('.js-anchor').listen('universalClick', function(e) {
        e.preventDefault();
        var id = e.currentTarget.getAttribute('data-for');
        smoothScroll.scrollTo(dom.id(id));
        goal.reach('ANCHOR_CLICKED', {
            'anchorFor': id
        });
    });

});

