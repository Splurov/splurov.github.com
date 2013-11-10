(function (d, w, c) {
    (w[c] = w[c] || []).push(function() {
        try {
            w.yaCounter19642528 = new Ya.Metrika({id:19642528,
                                                     //webvisor:true,
                                                     //clickmap:true,
                                                     trackLinks:true,
                                                     accurateTrackBounce:true});
            if (window.yandexMetrikaLoadCallback) {
                window.yandexMetrikaLoadCallback(w.yaCounter19642528);
            }
        } catch(e) { }
    });

    var n = d.getElementsByTagName("script")[0],
        s = d.createElement("script"),
        f = function () { n.parentNode.insertBefore(s, n); };
    s.type = "text/javascript";
    s.async = true;
    s.src = (d.location.protocol == "https:" ? "https:" : "http:") + "//mc.yandex.ru/metrika/watch.js";

    if (w.opera == "[object Opera]") {
        d.addEventListener("DOMContentLoaded", f, false);
    } else { f(); }
})(document, window, "yandex_metrika_callbacks");
