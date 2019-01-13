var pro = pro(document, window);

function pro(document, window, withoutDirty) {
    'use strict';

    var pro = {
        JSON: function (callback) {
            return function (data) {
                return callback(JSON.parse(data));
            }
        }
    };

    pro.element = function (tagName) {
        return document.createElement(tagName);
    };

    pro.selector = function (selector) {
        return document.querySelector(selector);
    };

    pro.class = function (className) {
        return document.getElementsByClassName(className);
    };

    pro.tag = function (tagName) {
        return document.getElementsByTagName(tagName);
    };

    pro.id = function (id) {
        return document.getElementById(id);
    };

    if (!withoutDirty) {
        extendHTMLElementsToProAndDirty(HTMLElement.prototype);

        HTMLDocument.prototype.on = function (type, listener, options) {
            this.addEventListener(type, listener, options);
            return this;
        };

        HTMLDocument.prototype.no = function (type, listener, options) {
            this.removeEventListener(type, listener, options);
            return this;
        };
    }

    function extendHTMLElementsToProAndDirty(elementPrototype) {
        if (elementPrototype.on || elementPrototype.in
            || elementPrototype.out || elementPrototype.toClass
            || elementPrototype.outClass || elementPrototype.no
            || elementPrototype.is || elementPrototype.proClass
            || elementPrototype.proTag || elementPrototype.proId) {
            throw new Error('Pro JS can not extend HTMLElement to be sweet and dirty! Please pass "withoutDirty" argument "true" in "pro(document, window, withoutDirty)" function in order to start with ProJS.');
        }

        elementPrototype.to = function whichCannotBeFluentCauseOfDefaultValue(attribute, value) {
            this.setAttribute(attribute, value || '');
            return this;
        };

        elementPrototype.on = function (type, listener, options) {
            this.addEventListener(type, listener, options);
            return this;
        };

        elementPrototype.no = function (type, listener, options) {
            this.removeEventListener(type, listener, options);
            return this;
        };

        elementPrototype.out = function (attribute) {
            this.removeAttribute(attribute);
            return this;
        };

        elementPrototype.toClass = function (className) {
            this.classList.add(className);
            return this;
        };

        elementPrototype.outClass = function (className) {
            this.classList.remove(className);
            return this;
        };

        elementPrototype.is = function whichCannotBeFluentCauseOfReturnBoolValue(state) {
            return this.hasAttribute(state);
        };

        elementPrototype.proTag = function (tagName) {
            return this.getElementsByTagName(tagName);
        };

        elementPrototype.proClass = function (className) {
            return this.getElementsByClassName(className);
        };

        elementPrototype.proSelector = function (selector) {
            return this.querySelector(selector);
        }

        elementPrototype.proId = function (id) {
            return this.proSelector('#' + id);
        };
    }

    return pro;
}