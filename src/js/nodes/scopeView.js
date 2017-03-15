import m from 'mithril';
import { jsPlumb } from 'jsplumb';
import { sourceNode } from './source.js';
import { traceNode } from './trace.js';
import { scopeNode } from './scope.js';
import { getNodeByID, draw } from '../helpers.js';

import * as oscilloscope from '../oscilloscope.js';

export const scopeView = {
    oninit: function(vnode) {
    },
    view: function(vnode) {
        return m('canvas', {
            id: 'scope',
            style: {
                width: vnode.attrs.width,
                height: vnode.attrs.height
            },
            onmousedown: function(event){ vnode.attrs.scope.ctrl.onMouseDown(event, vnode.attrs.scope.ctrl); },
            onmouseup: function(event){ vnode.attrs.scope.ctrl.onMouseUp(event, vnode.attrs.scope.ctrl); },
            onmousemove: function(event){ vnode.attrs.scope.ctrl.onMouseMove(event, vnode.attrs.scope.ctrl); }
        })
    },
    oncreate: function(vnode){
        vnode.attrs.scope.ctrl = new oscilloscope.Oscilloscope(vnode.attrs.scope);
        draw(vnode.attrs.scope.ctrl);
    },
};