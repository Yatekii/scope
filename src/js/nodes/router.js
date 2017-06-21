import m from 'mithril';
import { scopeNode } from './scope.js';

export const router = {
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