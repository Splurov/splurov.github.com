(function (doc, w, c) {

    var getParams = function() {
        if (!w.yandexMetrikaParams || !Object.keys) {
            return null;
        }

        var paramsKeys = Object.keys(w.yandexMetrikaParams);
        if (!paramsKeys.length) {
            return null;
        }

        var params = {};
        paramsKeys.forEach(function(key) {
            params[key] = w.yandexMetrikaParams[key];
            delete w.yandexMetrikaParams[key];
        });
        return params;
    };

    (w[c] = w[c] || []).push(function() {
        try {
            w.yaCounter19642528 = new Ya.Metrika({
                id: 19642528,
                trackLinks: true,
                accurateTrackBounce: true,
                params: getParams()
            });
            if (w.yandexMetrikaLoadCallback) {
                w.yandexMetrikaLoadCallback(w.yaCounter19642528);
            }

            w.addEventListener('load', function() {
                var params = getParams();
                if (params !== null) {
                    w.yaCounter19642528.params(params);
                }
            }, false);
        } catch(e) {}
    });

    var s = doc.createElement('script');
    s.src = '//mc.yandex.ru/metrika/watch.js';
    doc.head.appendChild(s);
})(document, window, 'yandex_metrika_callbacks');
