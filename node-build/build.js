'use strict';

var path = require('path');
var fs = require('fs');
var translations = require('./translations');
var hogan = require('hogan.js');
var csso = require('csso');
var uglifyjs = require('uglify-js');
var autoprefixer = require('autoprefixer');

require('buffer');

// params: [is put in separate folder, language array key, changelog entry, is main clash of clans tempalate]
var sources = {
    'index-source.html': {'ru': [false, 0], 'en': [true, 1]},
    'clash-of-clans/index-source.html': {'en': [false, 1, 'first', true], 'json': [false, 1, true]},
    //'clash-of-clans/comments-source.html': {'en': [false, 1]},
    'clash-of-clans/version-history-source.html': {'en': [false, 1, 'all']},
    //'clash-of-clans/to-do-list-source.html': {'en': [false, 1]},
    '404-source.html': {'en': [false, 1]}
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

    var mk = require('../clash-of-clans/js/mk.calc.common.js');

    var createRows = function(type, tabIndexMultiplier) {
        var createLevelOption = function(value, index) {
            return {'value': value, 'text': (index + 1)};
        };

        var rows = [];
        mk.objectIterate(mk.calc.types[type], function(name, value) {
            var convertedName = mk.convertToTitle(name);
            var levelOptions = value[1].map(createLevelOption);
            levelOptions[levelOptions.length - 1].selected = true;
            var templateVars = {
                'id': name,
                'idDashed': name.replace(' ', '_'),
                'title': convertedName,
                'levelId': name + '-level',
                'levelContent': levelOptions,
                'summaryId': name + '-summary',
                'rowId': type + '-building-level-' + value[3],
                'tabIndexLevel': tabIndexMultiplier + value[3],
                'tabIndexValue': tabIndexMultiplier + 1000 + value[3],
                'objectType': type
            };
            if (type === 'spells') {
                templateVars.spells = true;
            }

            if (type === 'units' || type === 'dark') {
                var i;
                var barracksTimes = [];
                for (i = 1; i <= mk.calc.allBarracks[type].getMaxCount(); i++) {
                    barracksTimes.push({
                        'barrackQuantityId': 'quantity-' + name + '-' + i
                    });
                }
                templateVars.barracksTimes = barracksTimes;

                templateVars.subtractId = name + '-subtract';
                templateVars.tabIndexSubtract = tabIndexMultiplier + 4000 + value[3];
            }

            rows.push(templateVars);
        });

        vars[type + '_rows'] = rows;
    };

    createRows('units', 100);
    createRows('dark', 200);
    createRows('spells', 300);

    vars.armyCamps = [];
    mk.calc.armyCampsData.base.forEach(function(value) {
        vars.armyCamps.push({'value': value});
    });
    for (var value = mk.calc.armyCampsData.base[mk.calc.armyCampsData.base.length - 1];
         value <= mk.calc.armyCampsData.max;
         value += mk.calc.armyCampsData.step) {
        vars.armyCamps.push({'value': value});
    }
    vars.armyCamps[vars.armyCamps.length - 1].selected = true;

    vars.spellFactory = [];
    var i = -1;
    while (++i <= mk.calc.spellFactoryData.max) {
        vars.spellFactory.push({'value': i});
    }
    vars.spellFactory[vars.spellFactory.length - 1].selected = true;

};

for (var file in sources) {
    console.log('started: ' + file);
    var lastChangeTime = Math.round(fs.statSync(file).mtime.getTime() / 1000);
    translations.last_change = [lastChangeTime, lastChangeTime];

    var dir = path.dirname(file);
    if (dir) {
        dir += '/';
    }

    var dataSource = fs.readFileSync(file, 'utf8');
    dataSource = dataSource.replace(/<link rel="stylesheet" type="text\/css" href="([^"]+)"\/>/g, function(match, p1) {
        if (dataCache[p1]) {
            console.log('cached: ' + p1);
            return dataCache[p1];
        }
        var styleData = fs.readFileSync(dir + p1, 'utf8');
        styleData = styleData.replace(/\/\* build:css:([^ ]+) \*\//g, function(buildMatch, buildP1) {
            console.log('css sub: ' + buildP1);
            return fs.readFileSync(dir + buildP1, 'utf8');
        });
        styleData = autoprefixer('ios >= 5', 'chrome >= 21', 'ff >= 17', 'safari >= 5.1', 'ie >= 10', 'android >= 4', 'opera >= 12.1').compile(styleData);
        console.log('autoprefixer: ' + p1);
        styleData = csso.justDoIt(styleData);
        console.log('csso: ' + p1);

        styleData = styleData.replace(/url\(([^']+?\.png)\)/g, function(match, sp1) {
            return 'url(' + makeDataUri(sp1.substr(1)) + ')';
        });

        styleData = hoganPrepare('<style>' + styleData + '</style>')

        dataCache[p1] = styleData;

        return styleData;
    });

    dataSource = dataSource.replace(/<script src="([^"]+)"( data-compress="no")?><\/script>/g, function(match, p1, p2) {
        if (dataCache[p1 + p2]) {
            console.log('cached: ' + p1 + (p2 ? ' (no compress)' : ''));
            return dataCache[p1 + p2];
        }
        console.log('js: ' + p1);
        var scriptData = fs.readFileSync(dir + p1, 'utf8');
        scriptData = scriptData.replace(/\/\* build:js:([^ ]+) \*\//g, function(buildMatch, buildP1) {
            console.log('js sub: ' + buildP1);
            return fs.readFileSync(dir + buildP1, 'utf8');
        });
        scriptData = scriptData.replace(/\/\* build:hogan:([^ ]+) \*\//g, function(hoganMatch, hoganP1) {
            var templatePath = dir + hoganP1;
            var template = fs.readFileSync(templatePath, 'utf8');
            var compiled = hogan.compile(template, {'asString': 1});
            console.log('hogan: ' + hoganP1);
            return compiled;
        });
        if (!p2) {
            scriptData = uglifyjs.minify(scriptData, {
                'fromString': true,
                'output': {
                    'screw_ie8': true
                },
                'compress': {
                    'screw_ie8': true,
                    'unsafe': true
                }
            }).code;
            scriptData = scriptData.replace('"use strict";', '');
        }

        scriptData = hoganPrepare('<script>' + scriptData + '</script>');

        dataCache[p1 + p2] = scriptData;

        return scriptData;
    });

    var currentTemplate = hogan.compile(dataSource);

    for (var lang in sources[file]) {
        var jsonOutput = false;
        if (lang === 'json') {
            jsonOutput = true;
            lang = 'en';
        }
        var options = sources[file][lang];
        var translationsCurrent = {};
        for (var trName in translations) {
            translationsCurrent[trName] = translations[trName][options[1]];
        }

        var changelogForJson = {};
        if (options[2]) {
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

                if (jsonOutput) {
                    changelogForJson[(new Date(v[1]).getTime())] = v[2];
                }
                if (options[2] === 'first') {
                    break;
                }
            }
            if (options[2] === 'first') {
                translationsCurrent.firstChangelog = changelogParsed[0];
            } else {
                translationsCurrent.changelog = changelogParsed;
            }
        }

        var partials = {};
        if (options[3]) {
            partials.item_row = fs.readFileSync(dir + 'mustache/item_row.mustache', 'utf8');

            setItemRowsTemplates(translationsCurrent);
        }

        if (jsonOutput) {
            var dataForJson = currentTemplate.render(translationsCurrent, partials);
            dataForJson = dataForJson.replace(/^\s+/gm, '');
            dataForJson = dataForJson.replace(/\n+/g, ' ');
            dataForJson = dataForJson.replace(/url\('(.+?\.png)'\)/g, function(match, sp1) {
                return 'url(' + makeDataUri(sp1.substr(1)) + ')';
            });

            var jsonData = {
                'clash_of_clans': {
                    'code': {
                        'html': dataForJson,
                        'version': (new Date()).getTime()
                    },
                    'changelog': changelogForJson
                },
                'error': 0
            };

            fs.writeFileSync(currentDir + 'api/getUpdates.json', JSON.stringify(jsonData));
            console.log('json coc done');
        } else {
            translationsCurrent.web_only = true;

            var dataDest = currentTemplate.render(translationsCurrent, partials);

//            if (options[3]) {
//                dataDest = dataDest.replace(/src="(.+?\.png)"/g, function(match, imageSrc) {
//                    return 'src="' + makeDataUri(imageSrc.substr(1)) + '"';
//                });
//            }

            var currentDir = dir;
            if (options[0]) {
                currentDir += lang + '/';
            }

            var destName = path.basename(file).replace('-source', '');
            fs.writeFileSync(currentDir + destName, dataDest);
            console.log('done: ' + lang + ' ' + file);
        }
    }

}

console.log('all done');