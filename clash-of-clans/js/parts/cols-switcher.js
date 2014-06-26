part([
    'types',
    'dom',
    'localStorageSet'
], function(types, dom, localStorageSet) {

    'use strict';

    if (!window.mkIsSmallScreen) {
        return;
    }

    var all = ['distribution', 'level', 'quantity', 'total', 'subtract'];
    var views = {
        'light': {
            'quantity': ['level', 'quantity', 'total'],
            'subtract': ['quantity', 'subtract'],
            'distribution': ['distribution']
        },
        'dark': {
            'quantity': ['level', 'quantity', 'total'],
            'subtract': ['quantity', 'subtract'],
            'distribution': ['quantity', 'distribution']
        }
    };

    var switchView = function(type, view) {
        localStorageSet(type + '-view', view);

        all.forEach(function(col) {
            var colElements = dom.findCache('.js-col-' + type + '-' + col);
            var isHide = (views[type][view].indexOf(col) === -1);
            colElements.iterate(function(colEl) {
                dom.toggleClass(colEl, 'inactive', isHide);
                dom.toggleClass(colEl, 'active', !isHide);
                colEl.classList.remove('data__last');
            });
        });

        dom.find('.data tr').iterate(function(row) {
            var cells = row.querySelectorAll('.active');
            if (cells.length) {
                cells[cells.length - 1].classList.add('data__last');
            }
        });

        Object.keys(views[type]).forEach(function(viewItem) {
            var viewItemEl = document.querySelector(
                    '.js-cols-switcher[data-type="' + type + '"][data-view="' + viewItem + '"]'
            );
            dom.toggleClass(viewItemEl, 'button_selected', (view === viewItem));
        });
    };

    dom.find('.js-cols-switcher').listen('universalClick', function(e) {
        switchView(e.currentTarget.getAttribute('data-type'), e.currentTarget.getAttribute('data-view'));
    });

    ['light', 'dark'].forEach(function(type) {
        switchView(type, (localStorage.getItem(type + '-view') || 'quantity'));
    });

});