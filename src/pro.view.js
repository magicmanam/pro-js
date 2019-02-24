(function (pro) {
    'use strict';

    var unit = new pro.core();

    unit.name = function (name) {
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

    pro.view = unit;
})(pro);