(function() {

    'use strict';

    [
        '/clash-of-clans/i/objects-light.png',
        '/clash-of-clans/i/logo.svg'
    ].forEach(function(path) {
        var imageObj = new Image();
        imageObj.src = path;
    });

}());