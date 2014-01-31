part([
    'dom'
], function(dom) {
    'use strict';

    dom.find('.js-fold').iterate(function(fold) {
        dom.listen(fold.querySelector('.fold__switcher'), 'universalClick', function() {
            fold.classList.toggle('fold_opened');
        });
    });

});
