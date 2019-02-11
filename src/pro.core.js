pro = pro || {};

(function (pro) {
    'use strict';

    var globalCore = new Core();
    Core.error = function (callback) {
        globalCore.on('error', callback);
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
                } catch (err) { outError(err); }
            }
        } else {
            this.setEventData(action, { listeners: [listener], onceListeners: [] });
            this[action] = function (model, callback) { this.out(action, model, callback); };
        }

        return this;
    }

    Core.prototype.once = function (action, callback, skipLast) {
        var eventData = this.getEventData(action);

        if (eventData) {
            if (eventData.containsEventValue && !skipLast) {
                try {
                    callback(eventData.lastEventValue);
                } catch (err) { outError(err); }
            } else {
                eventData.onceListeners.push(callback);
            }
        } else {
            this.setEventData(action, { listeners: [], onceListeners: [callback] });
            this[action] = function (model, callback) { this.out(action, model, callback); };
        }

        return this;
    };

    Core.prototype.out = function (action, value, callback) {
        var eventData = this.getEventData(action);

        if (eventData) {
            eventData.listeners = eventData.listeners || [];
            eventData.listeners.forEach(function (listener) {
                try {
                    listener(value, callback);
                } catch (err) { outError(err); }
            });
            eventData.onceListeners.forEach(function (listener) {
                try {
                    listener(value, callback);
                } catch (err) { outError(err); }
            });
            eventData.onceListeners = [];
            eventData.lastEventValue = value;
            eventData.containsEventValue = true;
        } else {
            this.setEventData(action, { lastEventValue: value, listeners: [], onceListeners: [], containsEventValue: true });
        }
    };

    function outError(err) {
        var eventData = globalCore.getEventData('error'),
            listeners = (eventData || {}).listeners || [];

        if (listeners.length === 0) {
            throw err;
        }
        globalCore.error(err);
    }

    pro.core = Core;
})(pro);