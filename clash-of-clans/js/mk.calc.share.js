part([
    'savedData',
    'dom',
    'common',
    'converter',
    'favorites',
    'goal'
], function(savedData, dom, common, converter, favorites, goal) {

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

            urlData = savedData.dataArrayToObject(urlData);

            favorites.addBeforeShare();

            savedData.current = new common.Dict(urlData);
            savedData.save();
        }
    }

    var shareTwitter = dom.id('share-twitter');
    var shareFacebook = dom.id('share-facebook');
    var permalink = dom.id('share-permalink');
    dom.selectOnFocus(permalink);
    var makePermalink = function() {
        var url = 'http://mkln.ru/clash-of-clans/?s=';
        var data = common.objectCopy(savedData.current.getAll());
        data.settingsMode = 1;
        data = savedData.dataObjectToArray(data);
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
        shareTwitter.setAttribute(
            'href',
            'https://twitter.com/share?url=' + shareUrl + '&via=ClashCalc&hashtags=ClashOfClans'
        );
        shareFacebook.setAttribute(
            'href',
            'https://www.facebook.com/sharer/sharer.php?u=' + shareUrl
        );
    };

    var text = dom.id('share-text');
    dom.selectOnFocus(text);

    var superscriptNumbers = {
        '1': '¹',
        '2': '²',
        '3': '³',
        '4': '⁴',
        '5': '⁵',
        '6': '⁶',
        '7': '⁷',
        '8': '⁸',
        '9': '⁹'
    };

    var currencies = {
        'light': 'Elixir',
        'dark': 'Dark Elixir',
        'spells': 'Elixir'
    };

    var makeShareText = function(result) {
        var output = [];
        var prices = [];

        ['light', 'dark', 'spells'].forEach(function(type) {
            if (type !== 'spells') {
                result[type].objects.sort(function(a, b) {
                    return a.minBarrackLevel - b.minBarrackLevel;
                });
            }

            result[type].objects.forEach(function(objectResult) {
                if (objectResult.summaryCost) {
                    output.push(
                        common.convertToTitle(objectResult.name) +
                        superscriptNumbers[objectResult.level] +
                        ' ×' +
                        objectResult.quantity
                    );
                }
            });
            if (result[type].totalCost) {
                prices.push(common.numberFormat(result[type].totalCost) + ' ' + currencies[type]);
            }
        });

        if (output.length) {
            text.value = output.join(', ') + ' — ' + prices.join(', ');
            return true;
        }
        return false;
    };

    var shareObjects = dom.find('.js-share');
    var placeShareContent = function(result) {
        var display = '';
        if (makeShareText(result)) {
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
