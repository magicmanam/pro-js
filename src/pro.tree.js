(function (pro) {
    'use strict';

    pro.tree = tree();
    pro.tree.new = tree;

    function tree() {
        var core = new pro.core(),
            pending = 0;

        core.on('depth', function (leaves) {
            inDepth(leaves);

            if (pending === 0) {
                core.out('end');
            } else {
                core.on('pending', function (count) {
                    if (count === 0) {
                        core.out('end');
                    }
                });
            }
        });

        core.on('pending', function (count) {
            pending += count;
        });

        function inDepth(leaves) {
            var i = 0;

            while (i < leaves.length) {
                let leaf = leaves[i++];
                core.node(leaf);
                inDepth(leaf.children);
            }
        }

        return core;
    }

    pro.tree.on('document', function () {
        pro.tree.depth(document.children);
    });
})(pro);