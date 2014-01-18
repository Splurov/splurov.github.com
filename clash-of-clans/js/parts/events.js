part('events', function() {
    'use strict';

    return {

        events: {},
        future: {},

        trigger: function(name, data, future) {
            if (this.events[name]) {
                this.events[name].forEach(function(event) {
                    event(data);
                });
            } else if (future) {
                if (!this.future[name]) {
                    this.future[name] = [];
                }
                this.future[name].push(data || {});
            }
        },

        watch: function(name, cb) {
            if (!this.events[name]) {
                this.events[name] = [];
            }
            this.events[name].push(cb);

            if (this.future[name]) {
                this.future[name].forEach(cb);
            }
        }

    };
});
