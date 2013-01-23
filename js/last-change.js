var lastChange = document.querySelector('.js-last-change');
var lastChangeDate = new Date(lastChange.getAttribute('data-last-change') * 1000);
var months = [
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
lastChange.appendChild(document.createTextNode(
    lastChangeDate.getDate() +
    ' ' +
    months[lastChangeDate.getMonth()] +
    ' ' +
    lastChangeDate.getFullYear() +
    ' года'
));
lastChange.style.visibility = 'visible';