// http://mathiasbynens.be/notes/async-analytics-snippet
(function(w, d, n) {
    w['GoogleAnalyticsObject'] = n;
    w[n] = w[n] || function() {
        (w[n].q = w[n].q || []).push(arguments);
    };
    w[n].l = 1 * new Date();
    var ga = d.createElement('script');
    ga.src = '//www.google-analytics.com/analytics.js';
    d.head.appendChild(ga);
})(window, document, 'ga');

ga('create', 'UA-37991363-1', 'mkln.ru');
ga('send', 'pageview');