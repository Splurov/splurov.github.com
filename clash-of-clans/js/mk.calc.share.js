part(['savedData', 'types', 'events', 'dom', 'barracks', 'common', 'converter'],
     function(savedData, types, events, dom, barracks, common, coverter) {

    'use strict';

    var urlParam;
    var oldUrlParam;

    if (location.search.indexOf('?l=') !== -1) {
        urlParam = true;
        oldUrlParam = true;
    } else if (location.search.indexOf('?s=') !== -1) {
        urlParam = true;
    }

    if (urlParam) {
        var urlData = location.search.substr(3);
        urlData = decodeURIComponent(urlData);
        var goalParams = {};
        goalParams[oldUrlParam ? 'l' : 's'] = urlData;
        events.trigger('goal', {
            'id': 'SHARE',
            'params': goalParams
        }, true);
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
            if (oldUrlParam) {
                converter.oldConvert3to4(urlData);
            }

            urlData = savedData.dataArrayToObject(urlData);

            events.trigger('save', {'showMessage': false}, true);
            savedData.current = new common.Dict(urlData);

            var viewSharedMessage = common.infoMessage('view-shared');
            viewSharedMessage.show();

            events.listen('loaded', function() {
                viewSharedMessage.hide();
            });
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
        'units': 'Elixir',
        'dark': 'Dark Elixir',
        'spells': 'Elixir'
    };

    var makeShareText = function() {
        var data = savedData.current.getAll();
        var output = [];
        var prices = [];
        Object.keys(types.data).forEach(function(type) {
            var maxLevel;
            if (type === 'spells') {
                maxLevel = data.spellFactoryLevel;
            } else {
                maxLevel = barracks[type].getMaxLevel(savedData.current);
            }
            Object.keys(types.data[type]).forEach(function(itemName) {
                if (data[itemName] > 0 && types.data[type][itemName][3] <= maxLevel) {
                    output.push(
                        common.convertToTitle(itemName) +
                        superscriptNumbers[data[itemName + '-level'] + 1] +
                        ' ×' +
                        data[itemName]
                    );
                }
            });
            var price = dom.id(type + '-cost').textContent;
            if (price !== '0') {
                prices.push(price + ' ' + currencies[type]);
            }
        });
        if (output.length) {
            text.value = output.join(', ') + ' — ' + prices.join(', ');
            return true;
        }
        return false;
    };

    var $shareObjects = dom.find('.js-share');
    var placeShareContent = function() {
        var display = '';
        if (makeShareText()) {
            makePermalink();
        } else {
            display = 'none';
        }
        $shareObjects.iterate(function(el) {
            el.style.display = display;
        });
    };

    events.listen('calculated', placeShareContent);

});
