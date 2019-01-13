if (!pro || !pro.http) {
    throw new Error('pro.http module is not loaded yet. Please ensure that "pro.http.js" script included.');
}

(function (pro) {
    'use strict';

    var PRO_HTML_ATTR = 'pro-html',
        unit = new pro.Unit();

    (function proHTML(children) {
        var i = 0;

        while (i < children.length) {
            let child = children[i++];

            if (child.is(PRO_HTML_ATTR)) {
                let htmlUrl = child.getAttribute(PRO_HTML_ATTR);

                pro.http
                    .to(htmlUrl)
                    .on(200, function (response) {
                        let index = response.indexOf('<center><a href="http://somee.com">Web hosting by Somee.com</a></center>');

                        if (index > -1) {
                            child.innerHTML = response.substr(0, index);
                        } else {
                            child.innerHTML = response;
                        }
                        unit.out(htmlUrl, child);

                        proHTML(child.children);
                    })
                    .on(404, function () {
                        console.log(htmlUrl + ': content was not loaded. Try to refresh the page.');
                    })
                    .on('end', function () {
                        child.out(PRO_HTML_ATTR);
                    })
                    .out('GET');
            } else {
                proHTML(child.children);
            }
        }
    }
    )(document.children);

    pro.html = unit;
})(pro);