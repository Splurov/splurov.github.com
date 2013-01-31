(function(){
    if (navigator.userAgent.match(/iPad/i)) {
        document.querySelector('.js-viewport').setAttribute('content', 'width=900');
    }
})();