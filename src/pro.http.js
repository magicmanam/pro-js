(function (pro) {
    'use strict';

    var core = new pro.core(),
        pending = 0;

    core.to = function (url) {
        var xhttp = new XMLHttpRequest(),
            innerCore = new pro.core(),
            sync = false, headers = [],
            status, response;

        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                status = this.status;
                response = this.responseText;

                core.out('pending', --pending);

                let eventData = { data: response, status: status, url: url };
                innerCore.out(status, eventData);
                core.out(status, response);

                let wellKnownEvent;
                if (status < 300) {
                    wellKnownEvent = 'success';
                } else if (status > 399) {
                    wellKnownEvent = 'fail';
                } else {
                    wellKnownEvent = 'redirect';
                }

                innerCore.out(wellKnownEvent, eventData);
                core.out(wellKnownEvent, eventData);
                
                innerCore.out('end', eventData);
                core.out('end', eventData);
            }
        };

        let that = {
            on: function (httpStatus, callback) {
                if (httpStatus) {
                    innerCore.on(httpStatus, callback);
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
                });
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

    core.on('fail', function (errorEvent) {
        if (!core.suppressErrors) {
            throw errorEvent;
        }
    });

    pro.http = core;
})(pro);
