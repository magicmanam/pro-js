if (!pro || !pro.core) {
    throw new Error('pro.core.js is missing');
}

(function (pro) {
    'use strict';

    var unit = new pro.core(),
        index = 0, linker = {};

    unit.view = function (name) {
        return function (create) {
            return {
                on: function (binder) {
                    unit.on(name, function (model, postBind) {
                        var view = create();
                        binder.call(view, model);
                        (postBind || function () { })(view);
                    });
                }
            };
        };
    };

    unit.to = function (element, property, data) {
        data.on(function (model) {
            new Glue1(element, property, model);
        });
        return;
        var proKey = element.dataset['pro'],
            obj;
        
        if (proKey) {
            obj = linker[proKey];
        } else {
            elementIndex = index++;
            element.dataset['pro'] = elementIndex;
            linker[elementIndex] = obj = {};
        }

        obj[property] = data;

        data.on(function (value) {
            obj[property] = value;
            element.bind(obj);
        })
    };

    pro.mvvm = unit;

    function Glue1(element, key, model) {
        var proExpression = element.getAttribute('pro');

        function evalWithVariables(func, vars) {
            var varString = '',
                me = element;

            for (var i in vars)
                varString += 'var ' + i + '=' + vars[i] + ';';

            varString += 'var ' + key + '=' + JSON.stringify(model) + ';';
            
            eval('(function(){' + varString + func + '})()');
        }
        evalWithVariables(proExpression, new Glue());
    }

    function Glue() { }

    Glue.prototype.show = function (value) {
        if (value) {
            me.out('hidden');
        } else {
            me.to('hidden');
        }
    };
    Glue.prototype.hide = function (value) {
        show(!value);
    };
    Glue.prototype.each = function (list, viewFn) {
        viewFn = viewFn || getBindFn(g.elem);
    };
    Glue.prototype.view = function (name) {
    };

})(pro);