(function(window, mk){

    'use strict';

    if (window.localStorage && window.localStorage.getItem('savedData') && !window.localStorage.getItem('data')) {
        var oldData = window.localStorage.getItem('savedData');
        oldData = (oldData && JSON.parse(oldData)) || {};

        if (oldData.armyCamps) {
            oldData.armyCamps = parseInt(oldData.armyCamps, 10);
        }

        var oldSaved = window.localStorage.getItem('savedCalculations');
        oldSaved = (oldSaved && JSON.parse(oldSaved)) || [];

        var barracksLevelsConverter = function(data) {
            var oldLevels = data.barracksLevels || [];
            oldLevels.forEach(function(item, i) {
                data['barracks-levels-' + (i + 1)] = item;
            });

            delete data.barracksLevels;

            var oldDarkLevels = data.darkBarracksLevels || [];
            oldDarkLevels.forEach(function(item, i) {
                data['dark-barracks-levels-' + (i + 1)] = item;
            });

            delete data.darkBarracksLevels;

            return data;
        };

        var newAll = [mk.calc.dataObjectToArray(barracksLevelsConverter(oldData))];
        
        oldSaved.forEach(function(oldSavedData) {
            if (oldSavedData.armyCamps) {
                oldSavedData.armyCamps = parseInt(oldSavedData.armyCamps, 10);
            }
            var newSavedData = mk.calc.dataObjectToArray(barracksLevelsConverter(oldSavedData));

            var newSavedDataJSON = JSON.stringify(newSavedData);

            var naIndex;
            var naLength;
            for (naIndex = 1, naLength = newAll.length; naIndex < naLength; naIndex++) {
                var entryJSON = JSON.stringify(newAll[naIndex]);
                if (newSavedDataJSON === entryJSON) {
                    return;
                }
            }

            newAll.push(newSavedData);
        });

        window.localStorage.setItem('data', JSON.stringify(newAll));
        //window.localStorage.removeItem('savedData');
        //window.localStorage.removeItem('savedCalculations');
    }

}(window, window.mk));