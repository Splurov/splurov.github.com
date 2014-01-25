part(['dom'], function(dom) {
    'use strict';

    var openedClass = 'fold_opened';

    dom.find('.js-fold').iterate(function(fold) {
        var storeId = fold.getAttribute('data-store');
        if (storeId) {
            var storedStatus = localStorage.getItem(storeId);
            dom.toggleClass(fold, openedClass, (storedStatus === null || storedStatus === 'opened'));
        }

        dom.listen(fold.querySelector('.fold__switcher'), 'universalClick', function() {
            fold.classList.toggle(openedClass);

            if (storeId) {
                var status = 'closed';
                if (fold.classList.contains(openedClass)) {
                    status = 'opened';
                }
                localStorage.setItem(storeId, status);
            }
        });
    });

});
