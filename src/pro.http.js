if (!pro || !pro.core) {
    throw new Error('pro.core.js is missing');
}

(function (pro) {
    'use strict';

    var core = new pro.core();

    core.to = function (url) {
        var xhttp = new XMLHttpRequest(),
            statusCallbacks = {},
            onceCallbacks = [],
            sync = false,
            headers = [];

        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                let status = this.status;
                let callbacks = statusCallbacks[status] || [];
                let response = this.responseText;

                core.out(status, response);

                callbacks.forEach(function (callback) {
                    callback(response);
                });

                onceCallbacks.forEach(function (callback) {
                    callback(response);
                });

                if (this.status < 300) {
                    callbacks = statusCallbacks['success'] || [];
                } else if (this.status > 399) {
                    callbacks = statusCallbacks['fail'] || [];
                }

                callbacks.forEach(function (callback) {
                    callback(response, status);
                });

                callbacks = statusCallbacks['end'] || [];
                callbacks.forEach(function (callback) {
                    callback(response, status);
                });

                core.out('end', response);
            }
        };

        let that = {
            on: function (status, callback) {
                if (statusCallbacks[status]) {
                    statusCallbacks[status].push(callback);
                } else {
                    statusCallbacks[status] = [callback];
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
            once: function (callback) {
                onceCallbacks.push(callback);
            },
            outJSON: function (verb, data) {
                that.header('Content-Type', 'application/json');
                that.out(verb, data);
            },
            out: function (verb, data, raw) {
                core.out('open', that);

                xhttp.open(verb, url, !sync);
                headers.forEach(function (header) {
                    xhttp.setRequestHeader(header.h, header.v);
                })
                xhttp.send(raw ? data : JSON.stringify(data));
            },
            outString: function (verb, data) {
                core.out('open', that);

                xhttp.open(verb, url, !sync);
                headers.forEach(function (header) {
                    xhttp.setRequestHeader(header.h, header.v);
                })
                xhttp.send(data);
            },
            get: function () { that.out('get'); },
            post: function (data, raw) { that.out('post', data, raw); },
            put: function (data, raw) { that.out('put', data, raw); },
            delete: function (data, raw) { that.out('delete', data, raw); }
        };

        return that;
    };

    pro.http = core;
})(pro);