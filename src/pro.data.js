if (!pro || !pro.core) {
    throw new Error('pro.core.js is missing');
}

(function (pro) {
    pro.data = function (data) {
        var core = new pro.core();

        function observ(rawData) {
            if (arguments.length === 0) {
                return data;
            } else {
                data = rawData;
                core.out('raw', data);//Or after all props ?
                if (typeof data === 'object' && !(data instanceof Array)) {//array into if
                    for (let prop in data) {
                        if (data.hasOwnProperty(prop)) {
                            let nested = observ[prop];

                            if (nested) {
                                nested(data[prop]);
                            } else {
                                observ[prop] = pro.data(data[prop]);
                            }
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