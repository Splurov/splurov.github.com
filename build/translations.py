# coding=utf-8

ga_code = """<script type="text/javascript">

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-37991363-1']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

</script>"""

ya_metrika_noscript = """<noscript><div><img src="//mc.yandex.ru/watch/19642528" style="position:absolute; left:-9999px;" alt="" /></div></noscript>"""

clash_of_clans = 'Clash of Clans'
coc_calc_title = 'Troops and Spells Cost Calculator'

translations = {
    'lang': ('ru', 'en'),
    'lang_switcher_href': ('/en/', '/'),
    'lang_switcher_title': ('In English', 'На русском'),
    'title': ('Михаил Калашник', 'Mikhail Kalashnik'),
    'born_info': ('Родился в Томске, живу в Москве.', 'I was born in Tomsk. Now I live in Moscow.'),
    'work_info': ('Работаю ведущим разработчиком и тимлидом команды продуктов в ', 'Worked as a senior developer and team lead of products team in '),
    'work_info_company': ('Хэдхантере', 'HeadHunter'),
    'email': ('Электронная почта', 'E-mail'),
    'skype': ('Скайп', 'Skype'),
    'add_to_skype': ('Добавить меня в контакты Скайпа', 'Add me to Skype contacts'),
    'photo_alt': ('Михаил Калашник, май 2012', 'Mikhail Kalashnik, May 2012'),
    'contacts': ('Контакты', 'Contacts'),
    'resume': ('Резюме', 'CV'),
    'hh_link_title': ('Хэдхантер', 'HeadHunter'),
    'moikrug_link_title': ('Мой Круг', 'Moi Krug'),
    'linkedin_link_title': ('Линкедин', 'LinkedIn'),
    'social_networks': ('Блоги/социальные сети', 'Blogs and Social Networks'),
    'twitter': ('Твитер', 'Twitter'),
    'vk': ('ВКонтакте', 'VK'),
    'facebook': ('Фейсбук', 'Facebook'),
    'friendfeed': ('Френдфид', 'FriendFeed'),
    'habr': ('Хабрахабр', 'Habrahabr'),
    'lepra': ('Лепрозорий', 'Leprosorium'),
    'instagram': ('Инстаграм', 'Instagram'),
    'google_plus': ('Гугл+', 'Google+'),
    'lj': ('ЖЖ', 'LiveJournal'),
    'pinterest': ('Пинтерест', 'Pinterest'),
    'github': ('Гитхаб', 'GitHub'),
    'movies_music': ('Фильмы/музыка', 'Movies and Music'),
    'imdb_viewed': ('IMDb просмотренные', 'IMDb Viewed'),
    'imdb_watchlist': ('IMDb «на посмотреть»', 'IMDb Watchlist'),
    'last_fm': ('Ласт.фм', 'Last.fm'),
    'tv_shows': ('Сериалы, которые я смотрю', 'TV Series'),
    'last_change_title': ('Последнее обновление', 'Last updated'),
    'hosting': ('За хостинг спасибо ', 'Thanks to '),
    'hosting_after': ('', ' for hosting'),
    'hosting_provider': ('Гитхабу', 'GitHub'),
    'given_name': ('Михаил', 'Mikhail'),
    'additional_name': ('Сергеевич', 'Sergeevich'),
    'family_name': ('Калашник', 'Kalashnik'),
    'locality': ('Москва', 'Moscow'),
    'country_name': ('Россия', 'Russia'),
    'ga_code': (ga_code, ga_code),
    'ya_metrika_noscript': (ya_metrika_noscript, ya_metrika_noscript),
    'clash_of_clans': ('Калькулятор стоимости армии и заклинаний для {0}'.format(clash_of_clans), '{0} for {1}'.format(coc_calc_title, clash_of_clans)),
    'miscellaneous': ('Разное', 'Miscellaneous'),
    'userscripts': ('Юзерскрипты для Фаерфокса', 'Userscripts for Firefox'),
    'minimum_font_size_addon': ('Дополнение для Фаерфокса — Minimum Font Size Hotkey', 'Firefox Add-on — Minimum Font Size Hotkey'),

    'coc_title': ('', '{0} — {1}'.format(clash_of_clans, coc_calc_title))
}