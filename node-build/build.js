'use strict';

var path = require('path');
var fs = require('fs');
var translations = require('./translations').translations;
var hogan = require('hogan.js');
var csso = require('csso');
var uglifyjs = require('uglify-js');
var autoprefixer = require('autoprefixer');

require('buffer');

var sources = {
    'index-source.html': {'ru': [false, 0], 'en': [true, 1]},
    'clash-of-clans/index-source.html': {'en': [false, 1, true], 'json': [false, 1, true]},
    '404-source.html': {'en': [false, 1]}
};

var hoganPrepare = function(input) {
    return '{{=<% %>=}}' + input + '<%={{ }}=%>';
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
        var styleData = fs.readFileSync(dir + p1, 'utf8');
        styleData = autoprefixer.compile(styleData);
        console.log('autoprefixer: ' + p1);
        styleData = csso.justDoIt(styleData);
        console.log('csso: ' + p1);

        styleData = styleData.replace(/url\((.+?\.png)\)/g, function(match, sp1) {
            var image = fs.readFileSync(sp1.substr(1), 'binary');
            console.log('data-uri: ' + sp1);
            return 'url(data:image/png;base64,' + (new Buffer(image, 'binary')).toString('base64') + ')';
        });

        return hoganPrepare('<style>' + styleData + '</style>');
    });

    dataSource = dataSource.replace(/<script src="([^"]+)"( data-compress="no")?><\/script>/g, function(match, p1, p2) {
        var scriptData = fs.readFileSync(dir + p1, 'utf8');
        if (!p2) {
            scriptData = uglifyjs.minify(scriptData, {'fromString': true}).code;
        }
        console.log('js: ' + p1);
        return hoganPrepare('<script>' + scriptData + '</script>');
    });

    var hoganTemplates = [];
    var position = 0;
    dataSource = dataSource.replace(/<script type="text\/x-build-hogan" src="([^"]+)"><\/script>/g, function(match, p1, offset) {
        var templatePath = dir + p1;
        var template = fs.readFileSync(templatePath, 'utf8');
        var compiled = hogan.compile(template, {'asString': 1});
        var compiledFull = 'templates.' + path.basename(templatePath).replace(/\..*$/, '') + ' = new Hogan.Template(' + compiled + ');';
        hoganTemplates.push(compiledFull);
        position = (position > 0 ? Math.min(offset, position) : offset);
        console.log('hogan: ' + p1);
        return '';
    });

    if (hoganTemplates.length) {
        var templates = 'var templates = {};\n' + hoganTemplates.join('\n');
        dataSource = dataSource.substring(0, position) +
                     hoganPrepare('<script>' + uglifyjs.minify(templates, {'fromString': true}).code + '</script>') +
                     dataSource.substring(position);
    }

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

        if (options[2]) {
            var changelog = require('../clash-of-clans/json/changelog.json');
            var changelogParsed = [];
            changelog.forEach(function(v, k) {
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
            });
            translationsCurrent.changelog = changelogParsed;
        }

        if (jsonOutput) {
            var dataForJson = currentTemplate.render(translationsCurrent);
            dataForJson = dataForJson.replace(/^\s+/gm, '');
            dataForJson = dataForJson.replace(/\n+/g, ' ');
            var jsonData = {
                'clash_of_clans': {
                    'code': {
                        'html': dataForJson,
                        'version': (new Date()).getTime()
                    }
                },
                'error': 0
            };

            fs.writeFileSync(currentDir + 'api/getUpdates.json', JSON.stringify(jsonData));
            console.log('json coc done');
        } else {
            translationsCurrent.web_only = true;
            var dataDest = currentTemplate.render(translationsCurrent);

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