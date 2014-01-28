(function() {

    'use strict';

/* нельзя использовать, потому что не откроется ни в одном нестандартном браузере
    if (navigator.userAgent.search(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i)!==-1) {
        window.location.replace('http://en.wikipedia.org/wiki/Copyright_infringement');
    }
*/

    if (window.top !== window.self) {
        window.top.location.replace(window.self.location.href);
    }

    var host = ['m', 'k', 'l'].concat(['n', '.', 'r', 'u']).join('');
    if (location.host !== host &&
        location.host !== 'test.' + host &&
        location.host.indexOf('192.168.1.') !== 0 &&
        location.host.indexOf('localhost') !== 0) {
        location.replace('http://' + host + '/clash-of-clans/');
    }

}());