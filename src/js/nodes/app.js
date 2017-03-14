import m from 'mithril';
import { jsPlumb } from 'jsplumb';
import { sourceNode } from './source.js';
import { traceNode } from './trace.js';

export const app = {
    oninit: function(vnode) {
        if(vnode.attrs.state){
            this.state = vnode.attrs.state;
        } else {
            this.state = {};
        }

        jsPlumb.ready(function(){
            // Bind connection event
            jsPlumb.bind('connection', function(info) {
                console.log(info);
            });

            // Bind connectionDetached event
            jsPlumb.bind('connectionDetached', function(info) {
                console.log(info);
            });
        });
    },
    view: function(vnode) {
        return [
            this.state.nodes.traces.map(node => m(node.node, node.state)),
            this.state.nodes.sources.map(node => m(node.node, node.state))
        ]
    },
    addTrace: function(trace) {
        this.state.nodes.traces.push({
            node: traceNode,
            state: {
                id: this.state.nodes.count,
                name: 'Trace ' + this.state.nodes.count
            }
        });
        this.state.nodes.count++;
        m.redraw();
    },
    addSource: function(source) {
        this.state.nodes.sources.push({
            node: sourceNode,
            state: {
                id: this.state.nodes.count,
                name: 'Source ' + this.state.nodes.count
            }
        });
        this.state.nodes.count++;
        m.redraw();
    }
};