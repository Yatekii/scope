import m from 'mithril';
import { sourceNode } from './source.js';

export const app = {
    oninit: function(vnode) {
        // if(vnode.attrs.ctrl){
        //     this.ctrl = vnode.attrs.ctrl;
        // } else {
        //     this.ctrl = {};
        // }
        this.nodes = [m('', 'KEK')];
    },
    view: function(vnode) {
        return m('', 'KEK');
        return vnode.state.nodes;
    },
    add: function() {
        console.log(this);
        // this.state.nodes.push(
        //     m(sourceNode, {
        //         ctrl: {
        //             type: 'KEK'
        //         }
        //     })
        // );
        // m.redraw();
    }
};