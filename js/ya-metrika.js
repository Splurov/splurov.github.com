(function (d, w, c, t) {

    var getParams = function() {
        if (!window.yandexMetrikaParams || !Object.keys) {
            return null;
        }

        var paramsKeys = Object.keys(window.yandexMetrikaParams);
        if (!paramsKeys.length) {
            return null;
        }

        var params = {};
        paramsKeys.forEach(function(key) {
            params[key] = window.yandexMetrikaParams[key];
            delete window.yandexMetrikaParams[key];
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
            if (window.yandexMetrikaLoadCallback) {
                window.yandexMetrikaLoadCallback(w.yaCounter19642528);
            }

            window.addEventListener('load', function() {
                var params = getParams();
                if (params !== null) {
                    w.yaCounter19642528.params(params);
                }
            }, false);
        } catch(e) {}
    });

    var n = d.getElementsByTagName(t)[0],
        s = d.createElement(t);
    s.async = true;
    s.src = '//mc.yandex.ru/metrika/watch.js';
    n.parentNode.insertBefore(s, n);
})(document, window, 'yandex_metrika_callbacks', 'script');
