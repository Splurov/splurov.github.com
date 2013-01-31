(function(){
    var lang = document.querySelector('.js-root').getAttribute('lang'),
        lastChange = document.querySelector('.js-last-change'),
        lastChangeDate = new Date(lastChange.getAttribute('data-last-change') * 1000),
        months,
        fullDate;
    if (lang == 'ru') {
        months = [
            'января',
            'февраля',
            'марта',
            'апреля',
            'мая',
            'июня',
            'июля',
            'августа',
            'сентября',
            'октября',
            'ноября',
            'декабря'
        ];
        fullDate = lastChangeDate.getDate() +
                   ' ' +
                   months[lastChangeDate.getMonth()] +
                   ' ' +
                   lastChangeDate.getFullYear() +
                   ' года';
    } else {
        months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];
        fullDate = months[lastChangeDate.getMonth()]  +
                   ' ' +
                   lastChangeDate.getDate() +
                   ', ' +
                   lastChangeDate.getFullYear();
    }
    lastChange.appendChild(document.createTextNode(fullDate));
    lastChange.style.visibility = 'visible';
})();