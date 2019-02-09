if (!pro || !pro.http || !pro.tree) {
    throw new Error('pro.tree.js or pro.http.js are missing');
}

(function (pro) {
    'use strict';

    var core = new pro.core();
    pro.load = core;

    pro.tree.on('leaf', function (leaf) {
        if (leaf.is('pro-load')) {
                let url = leaf.getAttribute('pro-load');

                pro.http
                    .to(url)
                    .on(200, function (response) {
                        leaf.innerHTML = response;

                        core.out(200, { url: url, element: leaf });
                        core.out(url, leaf);

                        pro.tree.depth(leaf.children);
                    })
                    .on(404, function () {
                        core.out(404, { url: url, element: leaf });
                    })
                    .on('end', function () {
                        leaf.out('pro-load');
                    })
                    .get();
            }
        });
})(pro);