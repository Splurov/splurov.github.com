part([
    'dom'
], function(dom){

    'use strict';

    if (!window.mkSupport.mobile) {
        return;
    }

    var ITEMS_ACTIVE_CLASS = 'menu__items_active';
    var SWITCHER_SELECTED_CLASS = 'menu__item_selected';

    var VISIBLE_POSITION = '18px';
    var HIDDEN_POSITION = '-999px';

    var switcher = document.querySelector('.js-menu-switcher');
    var items = document.querySelector('.js-menu-items');
    items.style.right = HIDDEN_POSITION;

    dom.listen(switcher, 'universalClick', function() {
        if (switcher.classList.contains(SWITCHER_SELECTED_CLASS)) {
            return;
        }

        items.classList.add(ITEMS_ACTIVE_CLASS);
        items.style.right = VISIBLE_POSITION;
        switcher.classList.add(SWITCHER_SELECTED_CLASS);
    });

    var hide = function() {
        items.classList.remove(ITEMS_ACTIVE_CLASS);
        switcher.classList.remove(SWITCHER_SELECTED_CLASS);
    };

    dom.listen(window, 'touchmove', hide);
    dom.listen(window, 'touchend', function(e) {
        if (e.target !== switcher) {
            hide();
        }
    });

    dom.listen(items, 'transitionend', function() {
        if (!items.classList.contains(ITEMS_ACTIVE_CLASS)) {
            items.style.right = HIDDEN_POSITION;
        }
    });

});
