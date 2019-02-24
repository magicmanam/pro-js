(function (pro) {
    'use strict';

    var core = new pro.core();
    pro.load = core;

    loadNodeForFree(pro.tree);

    function loadNodeForFree(tree) {
        tree.on('node', function (node) {
            if (node.is('pro-load')) {
                let url = node.getAttribute('pro-load');

                tree.pending(1);
                pro.http
                    .to(url)
                    .on(200, function (response) {
                        var subTree = tree.new();
                        node.innerHTML = response;
                        loadNodeForFree(subTree);
                        subTree.depth(node.children);

                        subTree.on('end', function () {
                            node.out('pro-load');
                            core.out(status, { url: url, element: node });
                            core.out(url, node);
                            tree.pending(-1);
                        });
                    })
                    .get();
            }
        });
    }
})(pro);