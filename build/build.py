import os.path
import subprocess
import re

last_change_time = os.path.getmtime('index-source.html')

def parse_source(path):
    stdout = subprocess.Popen(
        ['java', '-jar', '/Users/splurov/Work/yuicompressor/build/yuicompressor-2.4.8pre.jar', path],
        stdout=subprocess.PIPE
    ).stdout
    return stdout.read()

def get_path(path):
    print path
    return os.path.abspath(path)

def load_source(path):
    return open(path).read()

def link_repl(match):
    print 'link parse'
    return '<style>{0}</style>'.format(parse_source(get_path(match.group(1))))

def script_repl(match):
    path = get_path(match.group(1))
    if match.group(2) is None:
        print 'script parse'
        data = parse_source(path)
    else:
        print 'script get'
        data = load_source(path)
    return '<script>{0}</script>'.format(data)

def template(source, **params):
    for key, value in params.iteritems():
        source = source.replace('%' + key, str(value))

    return source

with open('index-source.html') as source:
    print 'read data'
    data = source.read()
    data = template(data, last_change=int(last_change_time))

    data = re.sub('<link rel="stylesheet" type="text/css" href="([^"]+)"/>', link_repl, data)
    data = re.sub('<script src="([^"]+)"( data-compress="no")?></script>', script_repl, data)

    with open('index.html', 'w') as dest:
        print 'write data'
        dest.write(data)

print 'all done'
