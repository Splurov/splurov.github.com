part([
    'storage',
    'dom',
    'common',
    'converter',
    'favorites',
    'goal'
], function(storage, dom, common, converter, favorites, goal) {

    'use strict';

    var version = 0;
    if (location.search.indexOf('?l=') !== -1) {
        version = 1;
    } else if (location.search.indexOf('?s=') !== -1) {
        version = 2;
    } else if (location.search.indexOf('?s3=') !== -1) {
        version = 3;
    }

    if (version !== 0) {
        var urlData = location.search.substr((version === 3 ? 4 : 3));
        urlData = decodeURIComponent(urlData);

        var goalParams = {};
        goalParams['shareV' + version] = urlData;
        goal.reach('SHARE', goalParams);

        urlData = urlData.replace(/[a-z]/g, ',');
        urlData = urlData.replace(/,(?=,)/g, ',0');
        if (urlData[0] === ',') {
            urlData = '0' + urlData;
        }
        urlData = '[' + urlData + ']';
        try {
            urlData = JSON.parse(urlData);
        } catch (ignore) {
            urlData = false;
        }

        history.replaceState({}, '', location.protocol + '//' + location.host + location.pathname);

        if (urlData) {
            if (version === 1) {
                converter.oldConvert3to4(urlData);
            } else if (version === 2) {
                converter.oldConvert4to5(urlData);
            }

            urlData = storage.dataArrayToObject(urlData);

            favorites.addBeforeShare();

            storage.current = new common.Dict(urlData);
            storage.save();
        }
    }

    var shareLinks = dom.find('.js-share-link');
    var permalink = dom.id('share-permalink');
    dom.selectOnFocus(permalink, function() {
        goal.reach('SHARE_LINK');
    });
    var makePermalink = function() {
        var url = 'http://mkln.ru/clash-of-clans/?s3=';
        var data = common.objectCopy(storage.current.getAll());
        data = storage.dataObjectToArray(data);
        data = JSON.stringify(data);
        data = data.replace(/\b(?:null|0)\b/g, '');
        data = data.substr(1, data.length - 2);
        data = data.replace(/,+$/, '');

        // 97 - a, 122 - z
        var charCode = 97;
        data = data.replace(/,/g, function() {
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
        shareLinks.iterate(function(shareLink) {
            shareLink.setAttribute('href', shareLink.getAttribute('data-share-link').replace('{url}', shareUrl));
        });
    };

    var shareObjects = dom.find('.js-share');
    var placeShareContent = function(result) {
        var display = '';
        var isAvailable = ['light', 'dark', 'spells'].some(function(type) {
            if (result[type].totalCost) {
                return true;
            }
        });
        if (isAvailable) {
            makePermalink();
        } else {
            display = 'none';
        }
        shareObjects.iterate(function(el) {
            el.style.display = display;
        });
    };

    // without timeout repaint of permalink.value in iOS took too much time
    var placeShareContentTimeout;
    dom.listenCustom('calculateDone', function(result) {
        clearTimeout(placeShareContentTimeout);
        placeShareContentTimeout = setTimeout(function() {
            placeShareContent(result);
        }, 300);
    });

});
