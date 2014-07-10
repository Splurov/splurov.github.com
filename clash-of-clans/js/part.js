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

if (typeof exports !== 'undefined') {
    module.exports = part;
}