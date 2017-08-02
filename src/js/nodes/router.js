/*
 * This is the main router component that gets instantiated by mithril when the root page is called
 * From here on all the components for the Flow Graph are added and routed.
 */

import m from 'mithril';
import { scopeNode } from './scope.js';

export const router = {
    view: function(vnode) {
        // Display all nodes. For now this is only scopes
        return [
            vnode.attrs.scopes.map(node => m(scopeNode, node))
        ];
    },
    oncreate: function(vnode){
        // Add parents to all traces and sources
        vnode.attrs.scopes.forEach(function(scope) {
            scope.source.traces.forEach(function(trace) {
                trace._source = scope.source;
            }, this);
            scope.source._scope = scope;
        });
    }
};