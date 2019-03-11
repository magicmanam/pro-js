(function (pro) {
    'use strict';

    var unit = new pro.core();

    unit.name = function (name) {
        return function (create) {
            return {
                on: function (binder) {
                    unit.on(name, function (model, postBind) {
                        var view = create();
                        // pass pro.data instead of raw model?
                        pro.mvvm.to(view, pro.data(model)); // Bad dependency order, but will be fixed after mvvm hacks will be added through extension point
                        binder.call(view, model);
                        (postBind || function () { })(view);
                    });
                }
            };
        };
    };

    pro.view = unit;
})(pro);