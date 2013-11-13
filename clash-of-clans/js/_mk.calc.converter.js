(function(){

    'use strict';

    if (localStorage && localStorage.getItem('savedData') && !localStorage.getItem('data')) {
        var oldData = localStorage.getItem('savedData');
        oldData = (oldData && JSON.parse(oldData)) || {};

        if (oldData.armyCamps) {
            oldData.armyCamps = parseInt(oldData.armyCamps, 10);
        }

        var oldSaved = localStorage.getItem('savedCalculations');
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

        localStorage.setItem('data', JSON.stringify(newAll));
    }

    if (localStorage.getItem('savedData')) {
        localStorage.removeItem('savedData');
        localStorage.removeItem('savedCalculations');
    }

    if (localStorage.getItem('data') && !localStorage.getItem('data2')) {
        var currentData = JSON.parse(localStorage.getItem('data'));
        var cdIndex;
        var cdLength;
        for (cdIndex = 1, cdLength = currentData.length; cdIndex < cdLength; cdIndex++) {
            mk.calc.saveMappingKeys.forEach(function(key, index) {
                if (key.indexOf('subtract') !== -1) {
                    currentData[cdIndex][index] = 0;
                }
            });
        }

        for (cdIndex = 1, cdLength = currentData.length; cdIndex < cdLength; cdIndex++) {
            var itemJSON = JSON.stringify(currentData[cdIndex]);
            var innerIndex;
            var innerLength;
            for (innerIndex = cdIndex + 1, innerLength = currentData.length; innerIndex < innerLength; innerIndex++) {
                var innerJSON = JSON.stringify(currentData[innerIndex]);
                if (itemJSON === innerJSON) {
                    currentData.splice(innerIndex, 1);
                    innerIndex--;
                    cdLength--;
                    innerLength--;
                }
            }
        }

        localStorage.setItem('data2', JSON.stringify(currentData));
        localStorage.removeItem('data');
    }

    if (localStorage.getItem('data2') && !localStorage.getItem('data3')) {
        var currentData2 = JSON.parse(localStorage.getItem('data2'));

        currentData2 = currentData2.map(function(dataset) {
            dataset.splice(46, 4);
            if (dataset[64]) {
                dataset.splice(64, 1);
            }
            return dataset;
        });

        localStorage.setItem('data3', JSON.stringify(currentData2));
        localStorage.removeItem('data2');
    }

}());