part(['dom'], function(dom) {
    'use strict';

    dom.find('.js-fold').iterate(function(fold) {
        var storeId = fold.getAttribute('data-store');
        if (storeId) {
            var storedStatus = localStorage.getItem(storeId);
            if (storedStatus === null || storedStatus === 'opened') {
                fold.classList.add('fold_opened');
            }
        }

        dom.listen(fold.querySelector('.fold__switcher'), 'universalClick', function() {
            fold.classList.toggle('fold_opened');

            if (storeId) {
                var status = 'closed';
                if (fold.classList.contains('fold_opened')) {
                    status = 'opened';
                }
                localStorage.setItem(storeId, status);
            }
        });
    });

});
