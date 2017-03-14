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
        var me = this;
        return m('canvas', {
            id: 'scope',
            style: {
                width: vnode.attrs.width,
                height: vnode.attrs.height
            },
            onmousedown: function(event){ me.ctrl.onMouseDown(event, me.ctrl); },
            onmouseup: function(event){ me.ctrl.onMouseUp(event, me.ctrl); },
            onmousemove: function(event){ me.ctrl.onMouseMove(event, me.ctrl); }
        })
    },
    oncreate: function(vnode){
        this.ctrl = new oscilloscope.Oscilloscope(vnode.attrs.scope);
        draw(this.ctrl);
    },
};