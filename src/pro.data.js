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