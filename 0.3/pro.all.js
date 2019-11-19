var pro = proFn(document);

function proFn(document) {
    'use strict';

    var pro = {
        JSON: function (callback) {
            return function (data) {
                return callback(JSON.parse(data));
            };
        },
        safe: function (callback) {
            return callback || function () { };
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
        };

        elementProto.proId = function (id) {
            return this.proSelector('#' + id);
        };

        elementProto.toChildFree = function () {
            while (this.firstChild) { this.removeChild(this.firstChild); }
        };
    }

    Array.prototype.remove = function (item) {
        for (let i = 0; i < this.length; i++) if (this[i] === item) {
            this.splice(i, 1);
        }
    };

    Array.prototype.clone = function () {
        return this.slice(0);
    };

    return pro;
}

(function (pro) {
    'use strict';

    var globalCore = new Core();

    Core.error = function (core, callback) {
        if (!callback) {
            callback = core;
            core = null;
        }

        globalCore.on('error', function (errorEvent) {
            if (!core || core === errorEvent.core) {
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

(function (pro) {
    'use strict';

    function Unit() {
        pro.core.apply(this, arguments);
        this.states = {};
    }

    Unit.prototype = Object.create(pro.core.prototype);
    Unit.prototype.constructor = Unit;

    Unit.prototype.state = function (name) {
        var module = this;

        if (this.states[name]) {
            throw new Error('State ' + name + ' is already defined.');
        } else {
            this.states[name] = {
                to: function (callback) {
                    this.onTo = callback;
                    return this;
                },
                out: function (callback) {
                    this.onOut = callback;
                },
                onTo: function () { },
                onOut: function () { }
            };

            return this.states[name];
        }
    };

    Unit.prototype.to = function (state, value, callback) {
        var currentStateHierarchy = this.currentState ? this.currentState.split('.') : [],
            newStateHierarchy = state.split('.'),
            commonState = '';

        while (currentStateHierarchy.length * newStateHierarchy.length !== 0 && currentStateHierarchy[0] === newStateHierarchy[0]) {
            commonState += currentStateHierarchy[0] + '.';
            currentStateHierarchy.shift();
            newStateHierarchy.shift();
        }

        while (currentStateHierarchy.length > 0) {
            this.states[commonState + currentStateHierarchy.join('.')].onOut();
            currentStateHierarchy.pop();
        }

        while (newStateHierarchy.length > 0) {
            this.states[commonState + newStateHierarchy[0]].onTo(value, callback);
            commonState += newStateHierarchy[0] + '.';
            newStateHierarchy.shift();
        }

        this.currentState = state;

        //TODO: Add logic based on previous state
        this.out(state, value);
        return this;
    };

    Unit.prototype.is = function (state) {// Add support of wildcard parameters: '*.state'
        return state === this.currentState;
    };

    Unit.prototype.unit = function (name) {
        // Should I subscribe on unit's exception? In this case I should rethrow it if an error occurred in any unit
        var unit = { name: name },
            unitFunc,
            parent = this,
            withDeps = false,
            dependenciesArray = [];
        //TODO: for debug
        window.unitss = window.unitss || [];
        window.unitss.push(name);//for debug

        unit.on = function () {
            var dependencies = arguments;

            unit.on = undefined;
            unit.out = undefined;

            return {
                out: function (unitFunc) {
                    var unresolvedDependenciesCount = dependencies.length,
                        index = 0;

                    if (unresolvedDependenciesCount > 0) {
                        withDeps = true;
                        dependenciesArray = Array(dependencies.length);

                        for (; index < dependencies.length; index++) {
                            parent.once(dependencies[index], (function (ind) {
                                return function (dep) {
                                    dependenciesArray[ind] = dep;

                                    if (--unresolvedDependenciesCount === 0) {
                                        out(unitFunc);
                                    }
                                };
                            })(index));
                        }
                    }
                }
            };
        };

        unit.out = out;

        function out(unitFunc) {
            unit = new Unit();
            unitFunc.apply(unit, dependenciesArray);
            parent.out(name, unit);
            //TODO: for debug
            window.units = window.units || [];
            window.units.push(name);//for debug
        }

        return unit;
    };

    pro.Unit = Unit;
})(pro);

(function (pro) {
    'use strict';

    var core = new pro.core(),
        pending = 0;

    core.to = function (url) {
        var xhttp = new XMLHttpRequest(),
            innerCore = new pro.core(),
            sync = false, headers = [],
            status, response;

        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                status = this.status;
                response = this.responseText;

                core.out('pending', --pending);

                let eventData = { data: response, status: status, url: url };
                innerCore.out(status, eventData);
                core.out(status, response);

                let wellKnownEvent;
                if (status < 300) {
                    wellKnownEvent = 'success';
                } else if (status > 399) {
                    wellKnownEvent = 'fail';
                } else {
                    wellKnownEvent = 'redirect';
                }

                innerCore.out(wellKnownEvent, eventData);
                core.out(wellKnownEvent, eventData);

                innerCore.out('end', eventData);
                core.out('end', eventData);
            }
        };

        let that = {
            on: function (httpStatus, callback) {
                if (httpStatus) {
                    innerCore.on(httpStatus, callback);
                }

                return that;
            },
            sync: function (isSync) {
                sync = !!isSync;
                return that;
            },
            header: function (header, value) {
                headers.push({ h: header, v: value });
                return that;
            },
            outJSON: function (verb, data) {
                that.header('Content-Type', 'application/json');
                return that.out(verb, data);
            },
            out: function (verb, data) {
                core.out('open', that);

                xhttp.open(verb, url, !sync);
                headers.forEach(function (header) {
                    xhttp.setRequestHeader(header.h, header.v);
                });
                xhttp.send(typeof data === 'object' ? JSON.stringify(data) : data);
                core.out('pending', ++pending);
                core.out('send', that);

                return that;
            },
            get: function () { return that.out('get'); },
            post: function (data) { return that.out('post', data); },
            put: function (data) { return that.out('put', data); },
            delete: function (data) { return that.out('delete', data); }
        };

        return that;
    };

    core.on('fail', function (errorEvent) {
        if (!core.suppressErrors) {
            throw errorEvent;
        }
    });

    pro.http = core;
})(pro);

(function (pro) {
    'use strict';

    pro.tree = tree();
    pro.tree.new = tree;

    function tree() {
        var core = new pro.core(),
            pending = 0;

        core.on('depth', function (leaves) {
            inDepth(leaves);

            if (pending === 0) {
                core.out('end');
            } else {
                core.on('pending', function (count) {
                    if (count === 0) {
                        core.out('end');
                    }
                });
            }
        });

        core.on('pending', function (count) {
            pending += count;
        });

        function inDepth(leaves) {
            var i = 0;

            while (i < leaves.length) {
                let leaf = leaves[i++];
                core.node(leaf);
                inDepth(leaf.children);
            }
        }

        return core;
    }

    pro.tree.on('document', function () {
        pro.tree.depth(document.children);
    });
})(pro);

(function (pro) {
    'use strict';

    var core = new pro.core();
    pro.load = core;

    loadNodeForFree(pro.tree);

    function loadNodeForFree(tree) {
        tree.on('node', function (node) {
            if (node.is && node.is('pro-load')) {
                let url = node.getAttribute('pro-load');
                let subTree = tree.new();

                tree.pending(1);
                pro.http
                    .to(url)
                    .on(200, function (response) {
                        node.innerHTML = response.data;
                        loadNodeForFree(subTree);
                        subTree.depth(node.children);
                    })
                    .on('end', function (response) {
                        subTree.on('end', function () {
                            node.out('pro-load');
                            core.out(response.status, { url: url, element: node });
                            if (response.status === 200) {
                                core.out(url, node);
                            }
                            tree.pending(-1);
                        });
                    })
                    .get();
            }
        });
    }
})(pro);

(function (pro) {
    pro.data = function (data) {
        var core = new pro.core(),
            outUpdate = true;

        function observ(rawData) {
            if (arguments.length === 0) {
                return data;
            } else {
                data = rawData;
                core.out('raw', data);
                if (typeof data === 'object') {
                    outUpdate = false;
                    if (data instanceof Array) {
                        data.forEach(ensureObservedProperty);
                        let i = data.length;
                        while (observ.hasOwnProperty[i]) { delete observ[i++]; }
                    } else {
                        for (let prop in data) if (data.hasOwnProperty(prop)) {
                            ensureObservedProperty(data[prop], prop);
                        }// Update all listeners which props were deleted
                    }
                    outUpdate = true;

                    function ensureObservedProperty(item, prop) {
                        let nested = observ[prop];

                        if (nested) {
                            nested(item);
                        } else {
                            observ[prop] = pro.data(item);
                            observ[prop].on(function (d) {
                                data[prop] = d;
                                core.out('child', data);
                            }, true);
                        }
                    }
                }
            }
        }

        observ(data);
        observ.on = function (fn) { core.on.call(core, 'raw', fn); };
        observ.no = function (fn) { core.no.call(core, 'raw', fn); };
        observ.once = function (fn) { core.once.call(core, 'raw', fn); };
        core.on('child', function (d) {
            if (outUpdate) {
                core.out('raw', d);
            }
        });

        return observ;
    };
})(pro);

(function (pro) {
    'use strict';

    var unit = new pro.core();

    unit.name = function (name) {
        return function (create) {
            return {
                on: function (binder) {
                    unit.on(name, function (model, postBind) {
                        var view = create();
                        pro.mvvm.to(view, pro.data(model)); // Bad dependency order, but will be fixed after mvvm hacks will be added through extension point
                        binder.call(view, model);
                        pro.safe(postBind)(view);
                    });
                }
            };
        };
    };

    pro.view = unit;
})(pro);

(function (pro) {
    'use strict';

    var unit = new pro.core();

    unit.to = function (view, vm) {
        let tree = pro.tree.new();

        tree.on('node', function (node) {
            if (node.is && node.is('pro')) {
                tree.once('end', function () {
                    vm.on(function (model) {
                        var modelKeys = '';

                        for (let key in model)
                            modelKeys += 'var ' + key + '=' + JSON.stringify(model[key]) + ';';

                        pro.mvvm.eval(node, modelKeys);
                    });
                });
            }
        });
        tree.depth([view]);
    };

    unit.eval = (function () {
        var node;

        function _value(value) {
            this.value = value;
        }
        function value(value) { _value.call(node, value); }

        function _css(styles) {
            for (var prop in styles) {
                this.style[prop] = styles[prop];
            }
        }
        function css(styles) { _css.call(node, styles); }

        function _placeholder(value) {
            this.placeholder = value || '';
        }
        function place(value) { _placeholder.call(node, value); }

        function _text(value) {
            this.textContent = value || '';
        }
        function text(value) { _text.call(node, value); }

        function _html(value) {
            this.innerHTML = value || '';
        }
        function html(value) { _html.call(node, value); }

        function _href(value) {
            this.to('href', value || '');
        }
        function href(value) { _href.call(node, value); }

        function _show(value) {
            (value ? this.out : this.to).call(this, 'hidden');
        }
        function show(value) { _show.call(node, value); }
        function hide(value) { _show.call(node, !value); }

        function _each(list, viewFn) {
            this.toChildFree();
            //viewFn = viewFn || getBindFn(g.elem);
            list.forEach(function (item) {
                viewFn(item);
            });
        }
        function each() { return _each.apply(node, arguments); }
        function _view(name) {
            var parent = this;

            return function (model) {
                pro.view.out(name, model, function (node) {
                    parent.appendChild(node);
                });
            };
        }
        function view(name) { return _view.call(node, name); }

        return function (element, models) {
            node = element;
            eval(models + node.getAttribute('pro'));
        };
    })();

    pro.mvvm = unit;
})(pro);

(function (pro) {
    pro.time = {};

    pro.time.Countdown = function ProTimer(secondsToCount, onTick) {
        var endDate = new Date() - secondsToCount * -1000,
            timeoutId;

        updateTime(secondsToCount);

        function updateTime() {
            if (secondsToCount >= 0) {
                onTick(secondsToCount);
                timeoutId = setTimeout(updateTime, parseInt((endDate - new Date()) / secondsToCount));
                secondsToCount--;
            }
        }

        return {
            out: function () { clearTimeout(timeoutId); }
        };
    };
})(pro);