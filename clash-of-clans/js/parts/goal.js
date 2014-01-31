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

    dom.find('.js-goal').listen('universalClick', function(e) {
        reach(e.currentTarget.getAttribute('data-goal'));
    });

    return {
        'reach': reach
    };

});
