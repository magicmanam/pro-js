(function (pro) {
    pro.data = function (data) {
        var core = new pro.core();

        function observ(rawData) {
            if (arguments.length === 0) {
                return data;
            } else {
                data = rawData;
                core.out('raw', data);
                if (typeof data === 'object') {
                    if (data instanceof Array) {
                        data.forEach(ensureObservedProperty);
                        let i = data.length;
                        while (observ.hasOwnProperty[i]) { delete observ[i++]; }
                    } else {
                        for (let prop in data) if (data.hasOwnProperty(prop)) {
                            ensureObservedProperty(data[prop], prop);
                        }// Update all listeners which props were deleted
                    }

                    function ensureObservedProperty(item, prop) {
                        let nested = observ[prop];

                        if (nested) {
                            nested(item);
                        } else {
                            nested = pro.data(item);
                            nested.on(function (d) {
                                data[prop] = d;
                                core.out('raw', data);
                            }, true);
                            observ[prop] = nested;
                        }
                    }
                }
            }
        }

        observ(data);
        observ.on = function (fn) { core.on.call(core, 'raw', fn); };
        observ.once = function (fn) { core.once.call(core, 'raw', fn); };

        return observ;
    };
})(pro);