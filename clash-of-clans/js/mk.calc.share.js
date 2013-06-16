(function(window, document, mk) {

    'use strict';

    var checkShare = function() {
        if (window.location.search.indexOf('?l=') !== -1) {
            var viewSharedMessage = mk.infoMessage('view-shared');

            var urlData = window.location.search.substr(3);
            urlData = decodeURIComponent(urlData);
            mk.calc.sharedLink = urlData;
            urlData = urlData.replace(/[a-z]/g, ',');
            urlData = urlData.replace(/,(?=,)/g, ',0');
            urlData = '[' + urlData + ']';
            urlData = JSON.parse(urlData);
            urlData = mk.calc.dataArrayToObject(urlData);

            if (window.history.replaceState) {
                window.history.replaceState(
                    {},
                    '',
                    window.location.protocol + '//' + window.location.host + window.location.pathname
                );
            }/* else {
                window.location = cleanUrl;
            }*/

            mk.calc.save(null, false);
            mk.calc.savedData = new mk.Dict(urlData);

            viewSharedMessage.show();
        }
    };
    checkShare();

    var shareTwitter = document.getElementById('share-twitter');
    var shareFacebook = document.getElementById('share-facebook');
    var permalink = document.getElementById('share-permalink');
    permalink.addEventListener('click', mk.selectAll, false);
    mk.calc.makePermalink = function() {
        var url = 'http://mkln.ru/clash-of-clans/?l=';
        var data = mk.calc.savedData.getAll();
        data = mk.calc.dataObjectToArray(data);
        data = JSON.stringify(data);
        data = data.replace(/\b(?:null|0)\b/g, '');
        data = data.substr(1, data.length - 2);
        data = data.replace(/,+$/, '');

        // 97 - a, 122 - z
        var charCode = 97;
        data = data.replace(/,/g, function(match, p1) {
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
        shareTwitter.setAttribute(
            'href',
            'https://twitter.com/share?url=' + shareUrl + '&via=ClashCalc&hashtags=ClashOfClans'
        );
        shareFacebook.setAttribute(
            'href',
            'https://www.facebook.com/sharer/sharer.php?u=' + shareUrl
        );
    };

}(window, document, window.mk));
