import m from 'mithril';
import { draw } from '../helpers.js';

import * as oscilloscope from '../oscilloscope.js';

export const scopeView = {
    oninit: function(vnode) {
        window.addEventListener('mousewheel', function(event){
            vnode.attrs.scope.ctrl.onScroll(event, vnode.attrs.scope.ctrl);
        }, false);
    },
    view: function(vnode) {
        return m('canvas', {
            id: 'scope',
            style: {
                width: vnode.attrs.width,
                height: vnode.attrs.height
            },
            onmousedown: function(event) { vnode.attrs.scope.ctrl.onMouseDown(event); },
            onmouseup: function(event) { vnode.attrs.scope.ctrl.onMouseUp(event); },
            onmousemove: function(event) { vnode.attrs.scope.ctrl.onMouseMove(event); },
        });
    },
    oncreate: function(vnode){
        vnode.attrs.scope.ctrl = new oscilloscope.Oscilloscope(vnode.attrs.scope);
        // First draw to invoke all subsequnt draws on each rendered frame
        draw(vnode.attrs.scope.ctrl);
    },
};