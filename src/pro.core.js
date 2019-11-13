pro = pro || {};

(function (pro) {
    'use strict';

    var globalCore = new Core();

    Core.error = function (core, callback) {
        if (!callback) {
            callback = core;
            core = null;
        }

        globalCore.on('error', function (errorEvent) {
            if (!core || core === errorEvent.core)
            {
                callback(errorEvent);
            }
        });
    };

    function Core() {
        this.actionsMap = {};
    }

    Core.prototype.getEventData = function (action) {
        return this.actionsMap[action];
    };

    Core.prototype.setEventData = function (action, eventData) {
        this.actionsMap[action] = eventData;
    };

    Core.prototype.on = function (action, listener, skipLast) {
        var eventData = this.getEventData(action);

        if (eventData) {
            eventData.listeners.push(listener);
            if (eventData.containsEventValue && !skipLast) {
                try {
                    listener(eventData.lastEventValue);
                } catch (err) { outError(err, this); }
            }
        } else {
            this.setEventData(action, { listeners: [listener] });
            this[action] = function (model, callback) {
                return this.out(action, model, callback);
            };
        }

        return this;
    };

    Core.prototype.no = function (action, listener) {
        var eventData = this.getEventData(action);

        if (eventData) {
            eventData.listeners.remove(listener);
        }

        return this;
    };

    Core.prototype.once = function (action, callback, skipLast) {
        var me = this;

        this.on(action, wrapper, skipLast);

        function wrapper() {
            me.no(action, wrapper);
            callback.apply(me, arguments);
        }

        return this;
    };

    Core.prototype.out = function (action, value, callback) {
        var me = this,
            eventData = me.getEventData(action);

        if (eventData) {
            eventData.listeners.clone().forEach(function (listener) {
                try {
                    listener(value, callback);
                } catch (err) { outError(err, me); }
            });

            eventData.lastEventValue = value;
            eventData.containsEventValue = true;
        } else {
            me.setEventData(action, { lastEventValue: value, listeners: [], containsEventValue: true });
        }

        return me;
    };

    function outError(err, core) {
        var eventData = globalCore.getEventData('error'),
            listeners = (eventData || {}).listeners || [];

        if (listeners.length === 0) {
            throw err;
        }
        globalCore.error({ error: err, core: core });
    }

    pro.core = Core;
})(pro);