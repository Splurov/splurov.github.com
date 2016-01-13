#!/usr/bin/python

import random
import itertools

MIN_PASSWORD_LENGTH = 14

SYMBOLS = "-/;.,'"

with open('../words-dictionary.txt', 'r') as f:
    words = f.readlines()

random.shuffle(words)


def generate_password():
    current_length = 0

    random_number = str(random.randint(10, 999))
    current_length += len(random_number)

    random_words = []

    while (current_length - 1) < MIN_PASSWORD_LENGTH:
        word = random.choice(words).strip()
        current_length += len(word) + 1
        random_words.append(word)

    random_symbols = random.sample(SYMBOLS, len(random_words) - 1)
    random_words_group = ''.join(itertools.chain.from_iterable(
            itertools.izip_longest(random_words, random_symbols, fillvalue='')))

    password = [random_words_group, random_number]
    random.shuffle(password)
    password = ''.join(password)

    return password

print 'Content-Type: text/plain\n'

for i in range(0, 10):
    password = generate_password()
    print password + ' | ' + str(len(password))
