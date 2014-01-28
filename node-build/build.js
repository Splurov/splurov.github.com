'use strict';

var fs = require('fs');
var translations = require('./translations');
var hogan = require('hogan.js');
var csso = require('csso');
var uglifyjs = require('uglify-js');
var autoprefixer = require('autoprefixer');
var cssc = require('css-condense');
var htmlMinifier = require('html-minifier');

require('buffer');

var STATIC_PATH = './s/';
var STATIC_URI = '/s/';

var staticFiles = fs.readdirSync(STATIC_PATH);
staticFiles.forEach(function(file) {
    fs.unlinkSync(STATIC_PATH + file);
});

// params: [language array key, changelog entry, is main clash of clans template, target path]
var sources = {
    'mustache/index.mustache': {
        'ru': [0, false, false, 'index.html'],
        'en': [1, false, false, 'en/index.html'],
        'resource_dir': './'
    },
    'clash-of-clans/mustache/index.mustache': {
        'en': [1, 'first', true, 'clash-of-clans/index.html'],
        'resource_dir': './clash-of-clans/'
    },
    'clash-of-clans/mustache/version-history.mustache': {
        'en': [1, 'all', false, 'clash-of-clans/version-history.html'],
        'resource_dir': './clash-of-clans/'
    },
    'mustache/404.mustache': {
        'en': [1, false, false, '404.html'],
        'resource_dir': './'
    }
};

var hoganPrepare = function(input) {
    return '{{=<% %>=}}' + input + '<%={{ }}=%>';
};

var dataCache = {};

var makeDataUri = function(path) {
    var image = fs.readFileSync(path, 'binary');
    console.log('data-uri: ' + path);
    return 'data:image/png;base64,' + (new Buffer(image, 'binary')).toString('base64');
};

var setItemRowsTemplates = function(vars) {

    require('../clash-of-clans/js/parts/common.js');

    require('../clash-of-clans/js/parts/types.js');
    require('../clash-of-clans/js/parts/armyCamps.js');
    require('../clash-of-clans/js/parts/spellFactory.js');
    require('../clash-of-clans/js/parts/barracks.js');

    var part = require('../clash-of-clans/js/part.js');

    var typesHelper = {
        'light': {
            'tabIndex': 10,
            'title': 'Barracks',
            'objectTitle': 'Troop',
            'capacityBuilding': 'Army Camps',
            'currencyCode': 'elixir',
        },
        'dark': {
            'tabIndex': 20,
            'title': 'Dark Barracks',
            'objectTitle': 'Troop',
            'capacityBuilding': 'Army Camps',
            'currencyCode': 'dark-elixir',
        },
        'spells': {
            'tabIndex': 30,
            'title': 'Spell Factory',
            'objectTitle': 'Spell',
            'capacityBuilding': 'Spell Factory',
            'currencyCode': 'elixir'
        }
    };

    part(['armyCamps', 'spellFactory', 'types', 'barracks', 'common'], function(armyCamps, spellFactory, types, barracks, common) {
        var createLevelOption = function(value, index) {
            return {'value': value, 'text': (index + 1)};
        };

        vars.types = [];

        Object.keys(typesHelper).forEach(function(type) {
            var basicInfo = typesHelper[type];
            basicInfo[type] = true;
            basicInfo.type = type;

            var rows = [];
            Object.keys(types.data[type]).forEach(function(name) {
                var value = types.data[type][name];
                var convertedName = common.convertToTitle(name);
                var levelOptions = value[1].map(createLevelOption);
                levelOptions[levelOptions.length - 1].selected = true;
                var templateVars = {
                    'id': name,
                    'title': convertedName,
                    'levelContent': levelOptions,
                    'rowId': type + '-building-level-' + value[3],
                    'tabIndexValue': typesHelper[type].tabIndex + value[3]
                };

                if (type === 'light' || type === 'dark') {
                    var i;
                    var barracksTimes = [];
                    for (i = 1; i <= barracks[type].data.count; i++) {
                        barracksTimes.push({
                            'barrackQuantityId': 'quantity-' + name + '-' + i
                        });
                    }
                    templateVars.barracksTimes = barracksTimes;

                    templateVars.subtractId = name + '-subtract';
                    templateVars.tabIndexSubtract = typesHelper[type].tabIndex + 100 + value[3];
                }

                rows.push(templateVars);
            });

            basicInfo.objects = rows;

            if (['light', 'dark'].indexOf(type) !== -1) {
                var i = 0;
                basicInfo.barracks = [];
                while (++i <= barracks[type].data.count) {
                    var barrack = {'index': i, 'options': []};
                    var j = -1;
                    var options = [];
                    while (++j <= barracks[type].data.maxLevel) {
                        if (i === 1 && j === 0 && barracks[type].data.firstRequired) {
                            continue;
                        }
                        var selected = '';
                        barrack.options.push({'text': j});
                        options.push('<option value="' + j + '"' + selected + '>' + j + '</option>');
                    }
                    barrack.options[barrack.options.length - 1].selected = true;

                    basicInfo.barracks.push(barrack);
                }
            }

            vars.types.push(basicInfo);
        });


        vars.armyCamps = [];
        armyCamps.base.forEach(function(value) {
            vars.armyCamps.push({'value': value});
        });
        for (var value = armyCamps.base[armyCamps.base.length - 1];
             value <= armyCamps.max;
             value += armyCamps.step) {
            vars.armyCamps.push({'value': value});
        }
        vars.armyCamps[vars.armyCamps.length - 1].selected = true;

        vars.spellFactory = [];
        var i = -1;
        while (++i <= spellFactory.max) {
            vars.spellFactory.push({'value': i});
        }
        vars.spellFactory[vars.spellFactory.length - 1].selected = true;
    });

};

var getFileMTime = function(path) {
    return fs.statSync(path).mtime.getTime();
};

for (var file in sources) {
    console.log('started: ' + file);
    var lastChangeTime = Math.round(fs.statSync(file).mtime.getTime() / 1000);
    translations.last_change = [lastChangeTime, lastChangeTime];

    var dir = sources[file].resource_dir;

    var latestTime = 0;

    var dataSource = fs.readFileSync(file, 'utf8');
    dataSource = dataSource.replace(/<link rel="stylesheet" type="text\/css" href="([^"]+)"\/>/g, function(match, p1) {
        if (dataCache[p1]) {
            console.log('cached: ' + p1);
            return dataCache[p1];
        }
        var styleData = fs.readFileSync(dir + p1, 'utf8');

        latestTime = Math.max(latestTime, getFileMTime(dir + p1));

        styleData = styleData.replace(/\/\* build:css:([^ ]+) \*\//g, function(buildMatch, buildP1) {
            console.log('css sub: ' + buildP1);
            latestTime = Math.max(latestTime, getFileMTime(dir + buildP1));
            return fs.readFileSync(dir + buildP1, 'utf8');
        });
        styleData = autoprefixer(
            'ios >= 6',
            'chrome >= 21',
            'ff >= 24',
            'safari >= 6',
            'ie >= 10',
            'android >= 4',
            'opera >= 17'
        ).process(styleData).css;
        console.log('autoprefixer: ' + p1);
        styleData = styleData.replace(/url\(([^']+?\.png)\)/g, function(match, sp1) {
            return 'url(' + makeDataUri(sp1.substr(1)) + ')';
        });

        styleData = cssc.compress(styleData);
        console.log('cssc: ' + p1);

        styleData = csso.justDoIt(styleData);
        console.log('csso: ' + p1);

        fs.writeFileSync(STATIC_PATH + latestTime + '.css', styleData);

        styleData = '<link rel="stylesheet" href="' + STATIC_URI + latestTime + '.css"/>';

        //styleData = hoganPrepare('<style>' + styleData + '</style>');

        dataCache[p1] = styleData;

        return styleData;
    });

    latestTime = 0;

    dataSource = dataSource.replace(/<script src="([^"]+)"( data-compress="no")?( data-main="yes")?><\/script>/g, function(match, p1, p2, p3) {
        if (dataCache[p1 + p2]) {
            console.log('cached: ' + p1 + (p2 ? ' (no compress)' : ''));
            return dataCache[p1 + p2];
        }
        console.log('js: ' + p1);
        var scriptData = fs.readFileSync(dir + p1, 'utf8');

        latestTime = Math.max(latestTime, getFileMTime(dir + p1));

        scriptData = scriptData.replace(/\/\* build:js:([^ :]+) \*\//g, function(buildMatch, buildP1) {
            console.log('js sub: ' + buildP1);

            latestTime = Math.max(latestTime, getFileMTime(dir + buildP1));

            return fs.readFileSync(dir + buildP1, 'utf8');
        });
        scriptData = scriptData.replace(/\/\* build:hogan:([^ ]+) \*\//g, function(hoganMatch, hoganP1) {
            var templatePath = dir + hoganP1;
            var template = fs.readFileSync(templatePath, 'utf8');
            template = template.replace(/^\s+/gm, '');
            var compiled = hogan.compile(template, {'asString': 1});
            console.log('hogan: ' + hoganP1);

            latestTime = Math.max(latestTime, getFileMTime(dir + hoganP1));

            return compiled;
        });
        scriptData = scriptData.replace(/if \(typeof exports !== 'undefined'\) \{[^\}]+\}/g, '');
        if (!p2) {
            scriptData = uglifyjs.minify(scriptData, {
                'fromString': true,
                'output': {
                    'screw_ie8': true,
                    'comments': /build:js:vendor:/
                },
                'compress': {
                    'screw_ie8': true,
                    'unsafe': true
                }
            }).code;
            scriptData = scriptData.replace('"use strict";', '');
        }

        scriptData = scriptData.replace(/\/\* build:js:vendor:([^ ]+) \*\//g, function(buildMatch, buildP1) {
            console.log('js sub vendor: ' + buildP1);
            return fs.readFileSync(dir + buildP1, 'utf8') + '\n\n// Copyright 2014 Mikhail Kalashnik';
        });

        if (p3) {
            fs.writeFileSync(STATIC_PATH + latestTime + '.js', scriptData);

            scriptData = '<script src="' + STATIC_URI + latestTime + '.js" defer="defer"></script>';
        } else {
            scriptData = hoganPrepare('<script>' + scriptData + '</script>');
        }

        dataCache[p1 + p2] = scriptData;

        return scriptData;
    });

    var currentTemplate = hogan.compile(dataSource);

    for (var lang in sources[file]) {
        if (lang === 'resource_dir') {
            continue;
        }

        var options = sources[file][lang];
        var translationsCurrent = {};
        for (var trName in translations) {
            translationsCurrent[trName] = translations[trName][options[0]];
        }

        if (options[1]) {
            var changelog = require('../clash-of-clans/json/changelog.json');
            var changelogParsed = [];
            var clIndex;
            var clLength;
            for (clIndex = 0, clLength = changelog.length; clIndex < clLength; clIndex++) {
                var v = changelog[clIndex];
                var entry = {
                    'version': v[0],
                    'date': v[1],
                    'changes': []
                };

                if (v[3]) {
                    entry.ch_title = v[3];
                }

                v[2].forEach(function(sv) {
                    entry.changes.push({'change': sv});
                });

                changelogParsed.push(entry);

                if (options[1] === 'first') {
                    break;
                }
            }
            if (options[1] === 'first') {
                translationsCurrent.firstChangelog = changelogParsed[0];
            } else {
                translationsCurrent.changelog = changelogParsed;
            }
        }

        var partials = {};
        if (options[2]) {
            partials.item_row = fs.readFileSync(dir + 'mustache/item_row.mustache', 'utf8');

            setItemRowsTemplates(translationsCurrent);
        }

        var dataDest = currentTemplate.render(translationsCurrent, partials);

        dataDest = htmlMinifier.minify(dataDest, {
            'removeComments': true,
            'removeCommentsFromCDATA': false,
            'removeCDATASectionsFromCDATA': false,
            'collapseWhitespace': false,
            'collapseBooleanAttributes': true,
            'removeAttributeQuotes': true,
            'removeRedundantAttributes': true,
            'useShortDoctype': true,
            'removeEmptyAttributes': true,
            'removeOptionalTags': false,
            'removeEmptyElements': false,
            'removeScriptTypeAttributes': true,
            'removeStyleLinkTypeAttributes': true
        });

        //dataDest = dataDest.replace(/>(\s{2,})/g, '> ');
        //dataDest = dataDest.replace(/(\s{2,})</g, ' <');
        dataDest = dataDest.replace(/^\s+/gm, '');

        fs.writeFileSync(options[3], dataDest);
        console.log('done: ' + lang + ' ' + file);
    }

}

console.log('all done');