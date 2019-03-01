var pro = pro(document, window);

function pro(document, window) {
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

    extendHTMLElementsToProAndDirty(HTMLElement.prototype);

    HTMLDocument.prototype.on = function (type, listener, options) {
        this.addEventListener(type, listener, options);
        return this;
    };

    HTMLDocument.prototype.no = function (type, listener, options) {
        this.removeEventListener(type, listener, options);
        return this;
    };

    function extendHTMLElementsToProAndDirty(elementProto) {
        if (elementProto.on || elementProto.in
            || elementProto.out || elementProto.toClass
            || elementProto.outClass || elementProto.no
            || elementProto.is || elementProto.proClass
            || elementProto.proTag || elementProto.proId) {
            throw new Error('Pro JS can not extend HTMLElement to be sweet and dirty! Please pass "withoutDirty" argument "true" in "pro(document, window, withoutDirty)" function in order to start with ProJS.');
        }

        elementProto.to = function whichCannotBeFluentCauseOfDefaultValue(attribute, value) {
            this.setAttribute(attribute, value || '');
            return this;
        };

        elementProto.on = function (type, listener, options) {
            this.addEventListener(type, listener, options);
            return this;
        };

        elementProto.no = function (type, listener, options) {
            this.removeEventListener(type, listener, options);
            return this;
        };

        elementProto.out = function (attribute) {
            this.removeAttribute(attribute);
            return this;
        };

        elementProto.toClass = function (className) {
            this.classList.add(className);
            return this;
        };

        elementProto.outClass = function (className) {
            this.classList.remove(className);
            return this;
        };

        elementProto.is = function whichCannotBeFluentCauseOfReturnBoolValue(state) {
            return this.hasAttribute(state);
        };

        elementProto.proTag = function (tagName) {
            return this.getElementsByTagName(tagName);
        };

        elementProto.proClass = function (className) {
            return this.getElementsByClassName(className);
        };

        elementProto.proSelector = function (selector) {
            return this.querySelector(selector);
        }

        elementProto.proId = function (id) {
            return this.proSelector('#' + id);
        };

        elementProto.toChildFree = function () {
            while (this.firstChild) { this.removeChild(this.firstChild); }
        }
    }

    Array.prototype.remove = function (item) {
        for (let i = 0; i < this.length; i++) if (this[i] === item) {
            this.splice(i, 1);
        }
    }

    return pro;
}