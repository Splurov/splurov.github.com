(function(mk) {

    'use strict';

    var checkShare = function() {
        if (location.search.indexOf('?l=') !== -1) {
            var viewSharedMessage = mk.infoMessage('view-shared');

            var urlData = location.search.substr(3);
            urlData = decodeURIComponent(urlData);
            mk.Events.trigger('goal', {
                'id': 'SHARE',
                'params': {
                    'l': urlData
                }
            }, true);
            urlData = urlData.replace(/[a-z]/g, ',');
            urlData = urlData.replace(/,(?=,)/g, ',0');
            urlData = '[' + urlData + ']';
            urlData = JSON.parse(urlData);
            urlData = mk.calc.dataArrayToObject(urlData);

            if (history.replaceState) {
                history.replaceState(
                    {},
                    '',
                    location.protocol + '//' + location.host + location.pathname
                );
            }

            mk.Events.trigger('save', {'showMessage': false});
            mk.calc.savedData = new mk.Dict(urlData);

            viewSharedMessage.show();

            mk.Events.listen('loaded', function() {
                viewSharedMessage.hide();
            });
        }
    };
    checkShare();

    var shareTwitter = document.getElementById('share-twitter');
    var shareFacebook = document.getElementById('share-facebook');
    var permalink = document.getElementById('share-permalink');
    permalink.addEventListener('click', mk.selectAll, false);
    var makePermalink = function() {
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

    var text = document.getElementById('share-text');
    text.addEventListener('click', mk.selectAll, false);

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
        'spells': 'Gold'
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
            var price = document.getElementById(type + '-cost').textContent;
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

    var shareObjects = mk.getAllByClass('js-share');
    var placeShareContent = function() {
        if (makeShareText()) {
            makePermalink();
            shareObjects.forEach(function(el) {
                el.style.display = '';
            });
        } else {
            shareObjects.forEach(function(el) {
                el.style.display = 'none';
            });
        }
    };

    mk.Events.listen('calculated', placeShareContent);

}(window.mk));
