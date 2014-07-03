part('localStorageSet', [
    'dom',
    'goal',
    'navigation'
], function(dom, goal, navigation) {
    'use strict';

    var localStorageKnownKeys = [
        'data5',
        'light-boosted-1',
        'light-boosted-2',
        'light-boosted-3',
        'light-boosted-4',
        'dark-boosted-1',
        'dark-boosted-2',
        'spells-boosted',
        'light-view',
        'dark-view'
    ];

    var memoryMessageId = 'storage-quota-exceeded';
    var memoryMessageEl = dom.id(memoryMessageId);
    return function(key, value, favoritesCount) {
        if (typeof favoritesCount === 'undefined') {
            favoritesCount = -2;
        }

        var message;
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            goal.reach('QUOTA_EXCEEDED', {'quotaExceededFavoritesCount': favoritesCount.toString()});

            var tempData = {};
            localStorageKnownKeys.forEach(function(backupKey) {
                tempData[backupKey] = localStorage.getItem(backupKey);
            });
            localStorage.clear();
            Object.keys(tempData).forEach(function(backupKey) {
                if (tempData[backupKey]) {
                    localStorage.setItem(backupKey, tempData[backupKey]);
                }
            });
            tempData = null;

            try {
                localStorage.setItem(key, value);
            } catch (e) {
                if (favoritesCount > 0) {
                    goal.reach('QUOTA_EXCEEDED_AGAIN', {'quotaExceededAgainFavoritesCount': favoritesCount.toString()});
                    message = '<strong>Attention!</strong> Looks like we have exceeded the quota' +
                              ' to store Clash Calc data. Please remove unused army compositions from favorites.';
                } else {
                    var dataLength = -1;
                    var data = localStorage.getItem(localStorageKnownKeys[0]);
                    if (data) {
                        dataLength = data.length;
                    }

                    if (dataLength === -1 && navigator.userAgent.indexOf('Safari') !== -1) {
                        message = 'Looks like you are using private mode of the Safari browser, so it’s not possible' +
                                  ' to store Clash Calc data. Please turn off private mode if you want to preserve data' +
                                  ' between visits.';
                        dataLength = -2;
                    } else {
                        message = '<strong>Attention!</strong> Looks like we have exceeded the quota' +
                                  ' to store Clash Calc data.' +
                                  ' Normally this shouldn’t have happened.' +
                                  ' Perhaps your browser is configured in a special way.' +
                                  ' To fix the problem please check the settings related to the Local Storage.';
                    }

                    goal.reach('QUOTA_EXCEEDED_UNKNOWN', {'quotaExceededDataLength': dataLength.toString()});
                }
            }
        }

        if (message) {
            dom.updater.instantly(memoryMessageId, 'html', message);
            dom.updater.instantly(memoryMessageId, 'display', '');
            navigation.scrollTo(memoryMessageEl);

            return false;
        } else {
            dom.updater.instantly(memoryMessageId, 'display', 'none');

            return true;
        }
    };
});
