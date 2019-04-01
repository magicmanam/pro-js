(function (pro) {
    'use strict';

    var core = new pro.core(),
        pending = 0;

    core.to = function (url) {
        var xhttp = new XMLHttpRequest(),
            statusCallbacks = {},
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

                core.out('pending', --pending);
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
            outJSON: function (verb, data) {
                that.header('Content-Type', 'application/json');
                return that.out(verb, data);
            },
            out: function (verb, data) {
                core.out('open', that);

                xhttp.open(verb, url, !sync);
                headers.forEach(function (header) {
                    xhttp.setRequestHeader(header.h, header.v);
                })
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

    pro.http = core;
})(pro);