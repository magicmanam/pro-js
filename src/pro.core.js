﻿pro = pro || {};

(function (pro) {
    'use strict';

    var globalCore = new Core();
    Core.error = function (callback) {
        globalCore.on('error', callback);
    };

    function Core() {
        this.actionsMap = {};
    }

    Core.prototype.getActionData = function (action) {
        return this.actionsMap[action];
    };

    Core.prototype.setActionData = function (action, actionData) {
        this.actionsMap[action] = actionData;
    };

    Core.prototype.on = function (action, listener, skipLast) {
        var actionData = this.getActionData(action);

        if (actionData) {
            actionData.listeners.push(listener);
            if (actionData.containsEventValue && !skipLast) {
                try {
                    listener(actionData.lastEventValue);
                } catch (err) { outError(err); }
            }
        } else {
            this.setActionData(action, { listeners: [listener], onceListeners: [] });
            this[action] = function (model, callback) { this.out(action, model, callback); };
        }

        return this;
    }

    Core.prototype.once = function (action, callback, skipLast) {
        var actionData = this.getActionData(action);

        if (actionData) {
            if (actionData.containsEventValue && !skipLast) {
                try {
                    callback(actionData.lastEventValue);
                } catch (err) { outError(err); }
            } else {
                actionData.onceListeners.push(callback);
            }
        } else {
            this.setActionData(action, { listeners: [], onceListeners: [callback] });
            this[action] = function (model, callback) { this.out(action, model, callback); };
        }

        return this;
    };

    Core.prototype.out = function (action, value, callback) {
        var eventData = this.getActionData(action);

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
            this.setActionData(action, { lastEventValue: value, listeners: [], onceListeners: [], containsEventValue: true });
        }
    };

    function outError(err) { globalCore.out('error', err); }

    pro.core = Core;
})(pro);