pro = pro || {};

(function (pro) {
    'use strict';

    pro.http = new pro.Unit();

    pro.http.to = function (url) {
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

                pro.http.out(status, response);

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

                pro.http.out('end', response);
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
                pro.http.out('open', that);

                xhttp.open(verb, url, !sync);
                headers.forEach(function (header) {
                    xhttp.setRequestHeader(header.h, header.v);
                })
                xhttp.send(raw ? data : JSON.stringify(data));
            },
            outString: function (verb, data) {
                pro.http.out('open', that);

                xhttp.open(verb, url, !sync);
                headers.forEach(function (header) {
                    xhttp.setRequestHeader(header.h, header.v);
                })
                xhttp.send(data);
            }
        };

        return that;
    };
})(pro);