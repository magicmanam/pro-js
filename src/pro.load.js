(function (pro) {
    'use strict';

    var core = new pro.core();
    pro.load = core;

    loadNodeForFree(pro.tree);

    function loadNodeForFree(tree) {
        tree.on('node', function (node) {
            if (node.is && node.is('pro-load')) {
                let url = node.getAttribute('pro-load');
                let subTree = tree.new();

                tree.pending(1);
                pro.http
                    .to(url)
                    .on(200, function (response) {
                        node.innerHTML = response.data;
                        loadNodeForFree(subTree);
                        subTree.depth(node.children);
                    })
                    .on('end', function (response) {
                        subTree.on('end', function () {
                            node.out('pro-load');
                            core.out(response.status, { url: url, element: node });
                            if (response.status === 200) {
                                core.out(url, node);
                            }
                            tree.pending(-1);
                        });
                    })
                    .get();
            }
        });
    }
})(pro);