if (!pro || !pro.core) {
    throw new Error('pro.core.js is missing');
}

(function (pro) {
    'use strict';

    var core = new pro.core();
    core.on('depth', inDepth);
    pro.tree = core;

    function inDepth(leaves) {
        var i = 0;

        while (i < leaves.length) {
            let leaf = leaves[i++];
            core.node(leaf);
            inDepth(leaf.children);
        }
    }
})(pro);