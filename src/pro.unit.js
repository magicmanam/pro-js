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

    Unit.prototype.is = function (state) {
        return state === this.currentState;
    };

    Unit.prototype.unit = function (name) {
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
                        dependenciesArray = Array(dependencies.length)

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
        };

        return unit;
    };

    pro.Unit = Unit;
})(pro);