import m from 'mithril';
import { sourceNode } from './source.js';

export const app = {
    oninit: function(vnode) {
        if(vnode.attrs.state){
            this.state = vnode.attrs.state;
        } else {
            this.state = {};
        }
    },
    view: function(vnode) {
        return [
            this.state.nodes.traces.map(node => m(sourceNode, node.state)),
            this.state.nodes.sources.map(node => m(sourceNode, node.state))
        ]
    },
    addTrace: function(trace) {
        this.state.nodes.traces.push({
            node: sourceNode,
            state: {
                app: {
                    type: 'KEK'
                },
                type: 'Waveform',
                amplitude: 0.7,
                frequency: 1337,
                id: this.state.nodes.count
            }
        });
        this.state.nodes.count++;
        m.redraw();
    },
    addSource: function(source) {
        this.state.nodes.sources.push({
            node: sourceNode,
            state: {
                id: this.state.nodes.count
            }
        });
        this.state.nodes.count++;
        m.redraw();
    }
};