var part = (function() {
    'use strict';

    var parts = {};

    var buildDeps = function(deps) {
        return deps.map(function(dep) {
            return parts[dep];
        });
    };

    return function(nameOrDeps, depsOrFunc, func) {
        var fn = function() {
            if (typeof nameOrDeps === 'string') {
                parts[nameOrDeps] = func ? func.apply(null, buildDeps(depsOrFunc)) : depsOrFunc();
            } else {
                depsOrFunc.apply(null, buildDeps(nameOrDeps));
            }
        };

        fn();
    };
}());

if (typeof exports !== 'undefined') {
    module.exports = part;
}