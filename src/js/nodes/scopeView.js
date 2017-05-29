import m from 'mithril';
import { draw } from '../helpers.js';
import { FFTracePrefPane } from '../prefpanes/fftrace.js';
import { generalPrefPane } from '../prefpanes/general.js';

import * as oscilloscope from '../oscilloscope.js';

export const scopeView = {
    oninit: function(vnode) {
        window.addEventListener('mousewheel', function(event){
            vnode.attrs.scope.ctrl.onScroll(event, vnode.attrs.scope.ctrl);
        }, false);
    },
    view: function(vnode) {
        return [
            m('canvas', {
                id: 'scope',
                style: {
                    width: vnode.attrs.width,
                    height: vnode.attrs.height
                },
                onmousedown: function(event) { vnode.attrs.scope.ctrl.onMouseDown(event); },
                onmouseup: function(event) { vnode.attrs.scope.ctrl.onMouseUp(event); },
                onmousemove: function(event) { vnode.attrs.scope.ctrl.onMouseMove(event); },
            }),
            m('.panel', {
                id: 'prefpane',
                style: {
                    display: vnode.attrs.scope.ui.prefPane.open ? 'block' : 'none',
                }
            }, [
                m(generalPrefPane, { scope: vnode.attrs.scope }),
                vnode.attrs.scope.traces.map(function(value){
                    return value.node.type == 'FFTrace' ? [
                        m('.divider'),
                        m(FFTracePrefPane, { scopeConf: vnode.attrs.scope, traceConf: value })
                    ] : '';
                })
            ]),
            m('button.btn.btn-primary.btn-action.btn-lg', {
                id: 'toggle-prefpane',
                style: {
                    right: vnode.attrs.scope.ui.prefPane.open ? '' + (vnode.attrs.scope.ui.prefPane.width + 20) + 'px' : '' + 20 + 'px',
                },
                onclick: function(){
                    vnode.attrs.scope.ctrl.uiHandlers.togglePrefPane(vnode.attrs.scope.ctrl);
                }
            }, m('i.icon.icon-menu', ''))
        ];
    },
    oncreate: function(vnode){
        vnode.attrs.scope.ctrl = new oscilloscope.Oscilloscope(vnode.attrs.scope);
        // First draw to invoke all subsequnt draws on each rendered frame
        draw(vnode.attrs.scope.ctrl);
    },
};