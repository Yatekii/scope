import m from 'mithril';
import { jsPlumb } from 'jsplumb';
import { radioSelection } from './components.js';
import { withKey } from '../helpers.js';
import { NormalTrace } from '../trace.js';

export const traceNode = {
    oninit: function(vnode) {
        vnode.attrs.editingName = false;
    },
    view: function(vnode) {
        return m('.card.node.unselectable', {
            id: 'node-' + vnode.attrs.id,
            style: {
                top: vnode.attrs.top + 'px',
                left: vnode.attrs.left + 'px'
            }
        }, [
            m('.card-header', [
                m('.card-title', [
                    (vnode.attrs.editingName ?
                    m('.form-group', [
                        m('input.form-input', {
                            type: 'text',
                            id: 'trace-name-' + vnode.attrs.id,
                            value: vnode.attrs.name,
                            onkeypress: withKey(13, function(target){
                                vnode.attrs.name = target.value;
                                vnode.attrs.editingName = false;
                            })
                        })
                    ]) :
                    m('span', {
                        onclick: function() {
                            vnode.attrs.editingName = true;
                        }
                    }, vnode.attrs.name))
                    // TODO: Colorlabel here
                ]),
                m('.card-meta', [])
            ]),
            m('.card-body', '')
        ]);
    },
    oncreate: function(vnode) {
        jsPlumb.ready(function(){
            jsPlumb.draggable(vnode.dom.id, {
                grid:[50,50],
                stop: function(e){
                    vnode.attrs.top = e.pos[1];
                    vnode.attrs.left = e.pos[0];
                }
            });

            jsPlumb.addEndpoint(vnode.dom.id, { 
                anchor: [['Left', {shape: 'Rectangle'}], ['Right', {shape: 'Rectangle'}]],
                isSource: true,
                isTarget: true
            });
        })

        switch(vnode.attrs.type){
        default:
        case 'NormalTrace':
            vnode.attrs.ctrl = new NormalTrace(vnode.attrs);
            break;

        case 'KEK':
            break;
        }
    }
};