import m from 'mithril';
import { jsPlumb } from 'jsplumb';
import { scopeNode } from './scope.js';
import { getNodeByID } from '../helpers.js';

export const router = {
    oninit: function(vnode) {
    },
    view: function(vnode) {
        // Display all nodes. For now this is only scopes
        return [
            vnode.attrs.nodes.scopes.map(node => m(scopeNode, node))
        ];
    },
    oncreate: function(vnode){
        // Add parents to all traces and sources
        vnode.attrs.nodes.scopes.forEach(function(scope) {
            scope.source.traces.forEach(function(trace) {
                    trace.source = scope.source;
            }, this);
            scope.source.scope = scope;
        });
    }
};