part([
    'dom',
    'goal'
], function(dom, goal) {
    'use strict';

    dom.find('.js-fold').iterate(function(fold) {
        var switcher = fold.querySelector('.js-fold-switcher');
        var goalTarget = switcher.getAttribute('data-goal');
        dom.listen(switcher, 'universalClick', function() {
            fold.classList.toggle('fold_opened');
            goal.reach(goalTarget);
        });
    });

});
