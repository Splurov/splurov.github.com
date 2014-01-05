(function() {

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
        mk.Events.trigger('goal', {
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
        } catch (e) {
            urlData = false;
        }

        history.replaceState({}, '', location.protocol + '//' + location.host + location.pathname);

        if (urlData) {
            if (oldUrlParam) {
                mk.oldConvert3to4(urlData);
            }

            urlData = mk.calc.dataArrayToObject(urlData);

            mk.Events.trigger('save', {'showMessage': false});
            mk.calc.savedData = new mk.Dict(urlData);

            var viewSharedMessage = mk.infoMessage('view-shared');
            viewSharedMessage.show();

            mk.Events.listen('loaded', function() {
                viewSharedMessage.hide();
            });
        }
    }

    var shareTwitter = mk.$id('share-twitter');
    var shareFacebook = mk.$id('share-facebook');
    var permalink = mk.$id('share-permalink');
    mk.$Listen(permalink, ['focus'], mk.selectAll);
    var makePermalink = function() {
        var url = 'http://mkln.ru/clash-of-clans/?s=';
        var data = mk.objectCopy(mk.calc.savedData.getAll());
        data.settingsMode = 1;
        data = mk.calc.dataObjectToArray(data);
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

    var text = mk.$id('share-text');
    mk.$Listen(text, ['focus'], mk.selectAll);

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
        var data = mk.calc.savedData.getAll();
        var output = [];
        var prices = [];
        mk.objectIterate(mk.calc.types, function(type, items) {
            var maxLevel;
            if (type === 'spells') {
                maxLevel = parseInt(mk.calc.spellFactoryLevel.value, 10);
            } else {
                maxLevel = mk.calc.allBarracks[type].getMaxLevel();
            }
            mk.objectIterate(items, function(itemName, itemData) {
                if (data[itemName] > 0 && itemData[3] <= maxLevel) {
                    output.push(
                        mk.convertToTitle(itemName) +
                        superscriptNumbers[data[itemName + '-level'] + 1] +
                        ' ×' +
                        data[itemName]
                    );
                }
            });
            var price = mk.$id(type + '-cost').textContent;
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

    var $shareObjects = mk.$('.js-share');
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

    mk.Events.listen('calculated', placeShareContent);

}());
