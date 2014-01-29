var _gaq = _gaq || [];
window.onerror = function(message, file, line) {
    'use strict';

    // https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide
    _gaq.push([
        '_trackEvent',
        'Javascript Error',
        message,
        file + ':' + line + ' [' + navigator.userAgent + ']',
        0,
        true
    ]);

    return false;
};
