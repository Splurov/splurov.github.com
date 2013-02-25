# coding=utf-8

import os.path
import subprocess
import re
from string import Template
from time import time
from hashlib import md5
from os import utime
from functools import partial

from translations import translations

base_dir = os.path.abspath(os.path.dirname(__file__) + '/../')

def log(message, print_sum=False, previous_times=[]):
    current_time = time()
    if print_sum:
        sum_time = current_time - previous_times[0]
        message = '{0} (summary time taken: {1:.3f}s)'.format(message, sum_time)
    elif previous_times:
        time_taken = current_time - previous_times[-1]
        message = '{0} (time taken: {1:.3f}s)'.format(message, time_taken)
    print message
    previous_times.append(current_time)

def template_safe(text):
    return text.replace('$', '$$')

def parse_source(path):
    stdout = subprocess.Popen(
        ['java', '-jar', '/Users/splurov/Work/yuicompressor/build/yuicompressor-2.4.8pre.jar', path],
        stdout=subprocess.PIPE
    ).stdout
    data = stdout.read()
    log('parse {0}'.format(path))
    return data

def load_source(path):
    data = open(path).read()
    log('parse {0}'.format(path))
    return data

def get_cached_path(path):
    m = md5()
    m.update(path)
    path_hash = m.hexdigest()
    cached_path = os.path.abspath('_cache/{0}'.format(path_hash))
    return cached_path

def is_cached(cached_path, path_modified):
    if not os.path.exists(cached_path):
        return False

    if int(os.path.getmtime(cached_path)) != path_modified:
        return False

    return True

def make_cache(cached_path, data, path_modified):
    open(cached_path, 'w').write(data)
    utime(cached_path, (path_modified, path_modified))

def make_data_uris(data):
    def make_uri(match, mime_type):
        path = match.group(1)
        data_uri = open(base_dir + path).read().encode('base64').replace('\n', '')
        result = 'url(data:{0};base64,{1})'.format(mime_type, data_uri)
        log('make data uri {0}'.format(path))
        return result

    data = re.sub('url\((.+?\.png)\)', partial(make_uri, mime_type='image/png'), data)
    #data = re.sub('url\(\'(.+?\.woff)\'\)', partial(make_uri, mime_type='application/font-woff'), data)
    return data

def link_repl(match, dir=''):
    path = os.path.abspath(dir + match.group(1))
    path_modified = int(os.path.getmtime(path))

    cached_path = get_cached_path(path)

    if is_cached(cached_path, path_modified):
        data = open(cached_path).read()
    else:
        data = template_safe(parse_source(path))
        data = make_data_uris(data)
        make_cache(cached_path, data, path_modified)

    return '<style>{0}</style>'.format(data)

def script_repl(match, dir=''):
    path = os.path.abspath(dir + match.group(1))
    path_modified = int(os.path.getmtime(path))

    cached_path = get_cached_path(path)

    if is_cached(cached_path, path_modified):
        data = open(cached_path).read()
    else:
        if match.group(2) is None:
            data = parse_source(path)
        else:
            data = load_source(path)
        data = template_safe(data)
        make_cache(cached_path, data, path_modified)

    return '<script>{0}</script>'.format(data)

log('start')

sources = {
    'index-source.html': {'ru': (False, 0), 'en': (True, 1)},
    'clash-of-clans/index-source.html': {'en': (False, 1)},
}

for file, langs in sources.iteritems():
    last_change_time = int(os.path.getmtime(file))
    translations.update(last_change=(last_change_time, last_change_time))

    dir = os.path.dirname(file)
    if dir:
        dir = '{0}/'.format(dir)
    with open(file) as source:
        data = source.read()

        log('{0} - source read'.format(file))

        data = re.sub('<link rel="stylesheet" type="text/css" href="([^"]+)"/>', partial(link_repl, dir=dir), data)
        data = re.sub('<script src="([^"]+)"( data-compress="no")?></script>', partial(script_repl, dir=dir), data)

        log('{0} - replaces done'.format(file))

        template = Template(data)

        for lang, options in langs.iteritems():
            translations_current = {key: value[options[1]] for (key, value) in translations.iteritems()}
            data_ru = template.substitute(**translations_current)

            base_dir = dir
            if options[0]:
                base_dir = '{0}{1}/'.format(base_dir, lang)

            with open('{0}index.html'.format(base_dir), 'w') as dest:
                dest.write(data_ru)

            log('{0} version written'.format(lang))

log('all done', True)