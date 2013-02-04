# coding=utf-8

import os.path
import subprocess
import re
from string import Template
from time import time
from hashlib import md5
from os import utime

from translations import translations

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

def link_repl(match):
    path = os.path.abspath(match.group(1))
    path_modified = int(os.path.getmtime(path))

    cached_path = get_cached_path(path)

    if is_cached(cached_path, path_modified):
        data = open(cached_path).read()
    else:
        data = template_safe(parse_source(path))
        make_cache(cached_path, data, path_modified)

    return '<style>{0}</style>'.format(data)

def script_repl(match):
    path = os.path.abspath(match.group(1))
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

last_change_time = int(os.path.getmtime('index-source.html'))
translations.update(last_change=(last_change_time, last_change_time))

with open('index-source.html') as source:
    data = source.read()

    log('source read')

    data = re.sub('<link rel="stylesheet" type="text/css" href="([^"]+)"/>', link_repl, data)
    data = re.sub('<script src="([^"]+)"( data-compress="no")?></script>', script_repl, data)

    log('replaces done')

    template = Template(data)
    translations_ru = {key: value[0] for (key, value) in translations.iteritems()}
    data_ru = template.substitute(**translations_ru)

    with open('index.html', 'w') as dest:
        dest.write(data_ru)

    log('ru version written')

    translations_en = {key: value[1] for (key, value) in translations.iteritems()}
    data_en = template.substitute(**translations_en)

    with open('en/index.html', 'w') as dest:
        dest.write(data_en)

    log('en version written')

log('all done', True)