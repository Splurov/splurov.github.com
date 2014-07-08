part([
    'dom',
    'goal',
    'smoothScroll'
], function(dom, goal, smoothScroll){

    'use strict';

    dom.find('.js-anchor').listen('universalClick', function(e) {
        e.preventDefault();
        var id = e.currentTarget.getAttribute('data-for');
        smoothScroll.scrollTo(dom.id(id));
        goal.reach('ANCHOR_CLICKED', {
            'anchorFor': id
        });
    });

});
