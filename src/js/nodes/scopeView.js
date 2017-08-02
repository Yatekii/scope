import m from 'mithril';
import { draw } from '../helpers.js';
import { FFTracePrefPane } from '../prefpanes/fftrace.js';
import { TimeTracePrefPane } from '../prefpanes/timetrace.js';
import { generalPrefPane } from '../prefpanes/general.js';

import * as oscilloscope from '../oscilloscope.js';
import { WebsocketSource } from '../source.js';
import { TimeTrace } from '../timetrace.js';
import { FFTrace } from '../fftrace.js';

export const scopeView = {
    view: function(vnode) {
        const onode = vnode;
        return [
            // Render a canvas and register all necessary events to it
            m('', { 
                oncreate: function(vnode){
                    // Make sure the on scroll event is listened to
                    vnode.dom.addEventListener('mousewheel', function(event){
                        onode.attrs.scope._ctrl.onScroll(event, onode.attrs.scope._ctrl);
                        m.redraw();
                    });
                }
            }, m('canvas', {
                id: 'scope',
                style: {
                    width: vnode.attrs.width,
                    height: vnode.attrs.height
                },
                onmousedown: function(event) { vnode.attrs.scope._ctrl.onMouseDown(event); },
                onmouseup: function(event) { vnode.attrs.scope._ctrl.onMouseUp(event); },
                onmousemove: function(event) {
                    event.preventDefault(); vnode.attrs.scope._ctrl.onMouseMove(event);
                },
            })),
            // Render a settings panel if it is toggled otherwise render none
            m('.panel', {
                id: 'prefpane',
                style: {
                    display: vnode.attrs.scope.ui.prefPane.open ? 'block' : 'none',
                }
            }, [
                // Render one general settings pane and for each trace an individual one
                m(generalPrefPane, { scopeConf: vnode.attrs.scope }),
                vnode.attrs.scope.source.traces.map(function(trace){
                    return trace.type == 'FFTrace' ? [
                        m('.divider'),
                        m(FFTracePrefPane, { scopeConf: vnode.attrs.scope, traceConf: trace })
                    ] : trace.type == 'TimeTrace' ? [
                        m('.divider'),
                        m(TimeTracePrefPane, { scopeConf: vnode.attrs.scope, traceConf: trace })
                    ] : '';
                })
            ]),
            // Render a button to toggle the settings panel
            m('button.btn.btn-primary.btn-action.btn-lg', {
                id: 'toggle-prefpane',
                style: {
                    right: vnode.attrs.scope.ui.prefPane.open ? '' + (vnode.attrs.scope.ui.prefPane.width + 20) + 'px' : '' + 20 + 'px',
                },
                onclick: function(){ vnode.attrs.scope._ctrl.uiHandlers.togglePrefPane(vnode.attrs.scope._ctrl); }
            }, m('i.icon.icon-menu', ''))
        ];
    },
    oncreate: function(vnode){
        // Create a new scope controller and add its reference to the scope state object
        vnode.attrs.scope._ctrl = new oscilloscope.Oscilloscope(vnode.attrs.scope);

        // Initialize controllers for the source
        vnode.attrs.scope.source._ctrl = new WebsocketSource(vnode.attrs.scope.source);

        // Initialize controllers for the traces
        vnode.attrs.scope.source.traces.forEach(function(trace, i){
            switch(trace.type){
            default:
            case 'TimeTrace':
                trace._ctrl = new TimeTrace(i, trace);
                break;

            case 'FFTrace':
                trace._ctrl = new FFTrace(i, trace);
                break;
            }
        });

        // First draw to invoke all subsequnt draws on each rendered frame
        draw(vnode.attrs.scope._ctrl);
    },
};