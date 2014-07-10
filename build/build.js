'use strict';

var fs = require('fs');
var path = require('path');

var hogan = require('hogan.js');
//var csso = require('csso');
var uglifyjs = require('uglify-js');
var autoprefixer = require('autoprefixer');
var cssc = require('css-condense');
var htmlMinifier = require('html-minifier');
var less = require('less');
var Q = require('q');

var translations = require('./translations');
var strings = require('./strings');

var setItemRowsTemplates = require('./set-item-rows-templates');

var STATIC_PATH = './s/';
var STATIC_URI = '/s/';

var ROOT_DIR = __dirname.replace('/build', '');

var templates = [
    {
        'source': 'mustache/index.mustache',
        'translationKey': 0,
        'target': 'index.html'
    },
    {
        'source': 'mustache/index.mustache',
        'translationKey': 1,
        'target': 'en/index.html'
    },
    {
        'source': 'mustache/404.mustache',
        'translationKey': 1,
        'target': '404.html'
    },
    {
        'source': 'clash-of-clans/mustache/index.mustache',
        'target': 'clash-of-clans/index.html',
        'changelog': 'first',
        'main': true
    },
    {
        'source': 'clash-of-clans/mustache/version-history.mustache',
        'target': 'clash-of-clans/version-history.html',
        'changelog': 'all'
    }
];

var hoganPrepare = function(input) {
    return '{{=<% %>=}}' + input + '<%={{ }}=%>';
};

var dataCache = {};

var files = {};

templates.forEach(function(options) {
    var deferred = Q.defer();

    console.log('started: ' + options.source);

    fs.readFile(options.source, 'utf8', function(error, content) {
        if (error) {
            throw error;
        }

        content = content.replace(/<link rel="stylesheet" type="text\/(css|less)" href="([^"]+)"\/>/g, function(match, type, href) {
            var processStyles = function() {
                fs.readFile(ROOT_DIR + href, 'utf8', function(error, styleData) {
                    var processCss = function(styleData) {
                        styleData = cssc.compress(styleData);
                        console.log('cssc: ' + href);

//                        console.time('csso: ' + href);
//                        styleData = csso.justDoIt(styleData);
//                        console.timeEnd('csso: ' + href);

                        styleData = autoprefixer(
                            'ios >= 6',
                            'chrome >= 21',
                            'ff >= 24',
                            'safari >= 6',
                            'ie >= 10',
                            'android >= 4',
                            'opera >= 17'
                        ).process(styleData).css;
                        console.log('autoprefixer: ' + href);

                        files[href].resolve(hoganPrepare('<style>' + styleData + '</style>'));
                    };

                    if (type === 'less') {
                        less.render(styleData, {
                            'paths': path.dirname(ROOT_DIR + href)
                        }, function(error, css) {
                            if (error) {
                                console.error(error);
                            }
                            console.log('less: ' + href);

                            processCss(css);
                        });
                    } else {
                        setTimeout(function() {
                            processCss(styleData);
                        }, 0);
                    }
                });
            };

            var placeholder = '---###' + href + '###---';

            if (!files[href]) {
                files[href] = Q.defer();

                processStyles();
            } else {
                console.log('cached: ' + href);
            }

            files[href].promise.then(function(styleData) {
                content = content.replace(placeholder, styleData);
                deferred.resolve();
            });

            return placeholder;
        });

        content = content.replace(/<script src="([^"]+)"( data-compress="no")?( data-main="yes")?><\/script>/g, function(match, src, original, main) {
            if (dataCache[src + original]) {
                console.log('cached: ' + src + (original ? ' (no compress)' : ''));
                return dataCache[src + original];
            }
            console.log('js: ' + src);
            var scriptData = fs.readFileSync(ROOT_DIR + src, 'utf8');

            scriptData = scriptData.replace(/\/\* build:js:([^ :]+) \*\//g, function(buildMatch, buildPath) {
                console.log('js sub: ' + buildPath);

                return fs.readFileSync(ROOT_DIR + buildPath, 'utf8');
            });
            scriptData = scriptData.replace(/\/\* build:hogan:([^ ]+) \*\//g, function(hoganMatch, hoganPath) {
                var template = fs.readFileSync(ROOT_DIR + hoganPath, 'utf8');
                template = template.replace(/^\s+/gm, '');
                var compiled = hogan.compile(template, {'asString': 1});
                console.log('hogan: ' + hoganPath);

                return compiled;
            });

            scriptData = scriptData.replace(/if \(typeof exports !== 'undefined'\) \{[^\}]+\}/g, '');
            if (!original) {
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
                console.log('uglifyjs: ' + src);
                scriptData = scriptData.replace(/"use strict";/g, '');
            }

            scriptData = scriptData.replace(/\/\* build:js:vendor:([^ ]+) \*\//g, function(buildMatch, vendorPath) {
                console.log('js sub vendor: ' + vendorPath);
                return fs.readFileSync(ROOT_DIR + vendorPath, 'utf8') + '\n\n// Copyright 2014 Mikhail Kalashnik';
            });

            var output;
            if (main) {
                var fileName = path.basename(src);
                fs.writeFile(STATIC_PATH + fileName, scriptData);
                // When use async we don't know is dom content loaded fired or not
                // http://webreflection.blogspot.ru/2014/02/the-underestimated-problem-about-script.html
                output = hoganPrepare('<script src="' + STATIC_URI + fileName + '?' + (new Date()).getTime() + '" async="async"></script>');
            } else {
                output = hoganPrepare('<script>' + scriptData + '</script>');
            }


            dataCache[src + original] = output;

            return output;
        });

        deferred.promise.then(function() {
            var currentTemplate = hogan.compile(content);
            console.log('hogan: ' + options.source);

            var templateVars = {};
            if ('translationKey' in options) {
                Object.keys(translations).forEach(function(key) {
                    templateVars[key] = translations[key][options.translationKey];
                });
            }

            Object.keys(strings).forEach(function(key) {
                templateVars[key] = strings[key];
            });

            if (options.changelog) {
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
                }
                if (options.changelog === 'first') {
                    templateVars.firstChangelog = changelogParsed[0];
                    templateVars.secondChangelog = changelogParsed[1];
                } else {
                    templateVars.changelog = changelogParsed;
                }
            }

            var partials = {};
            var finalProcessing = function() {
                var dataDest = currentTemplate.render(templateVars, partials);

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
                    'removeStyleLinkTypeAttributes': true,
                    'ignoreCustomComments': [/license/]
                });

                dataDest = dataDest.replace(/^\s+/gm, '');

                fs.writeFile(options.target, dataDest, function(error) {
                    if (error) {
                        throw error;
                    }
                    console.log('done: ' + options.target);
                });
            };

            if (options.main) {
                setItemRowsTemplates(templateVars);

                fs.readFile(ROOT_DIR + '/clash-of-clans/mustache/item_row.mustache', 'utf8', function(error, subTemplate) {
                    if (error) {
                        throw error;
                    }

                    partials.item_row = subTemplate;

                    finalProcessing();
                });
            } else {
                finalProcessing();
            }

        });
    });

});