part('events', function() {
    'use strict';

    return {

        events: {},

        trigger: function(name, data) {
            if (this.events[name]) {
                this.events[name].forEach(function(event) {
                    event(data);
                });
            }
        },

        watch: function(name, cb) {
            if (!this.events[name]) {
                this.events[name] = [];
            }
            this.events[name].push(cb);
        }

    };
});
